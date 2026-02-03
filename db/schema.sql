-- borramos las tablas si existen para empezar limpio
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- tabla de categorias
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- tabla de productos con validaciones de precio y stock
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_products_price_positive CHECK (price > 0),
    CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0)
);

-- tabla de clientes con email unico
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- tabla de ordenes
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    channel VARCHAR(50) NOT NULL DEFAULT 'Presencial',
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- items de cada orden
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_order_items_qty_positive CHECK (qty > 0)
);

-- tabla de pagos
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    method VARCHAR(50) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_payments_amount_positive CHECK (paid_amount > 0)
);

-- vista de ventas diarias
CREATE OR REPLACE VIEW vw_sales_daily AS
SELECT 
    DATE(o.created_at) AS sale_date,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT o.customer_id) AS unique_customers,
    SUM(oi.qty * oi.unit_price) AS total_revenue,
    SUM(oi.qty) AS total_items_sold,
    o.channel
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'Finalizado'
GROUP BY DATE(o.created_at), o.channel
ORDER BY sale_date DESC;

-- vista de productos mas vendidos
CREATE OR REPLACE VIEW vw_top_products AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.price AS unit_price,
    SUM(oi.qty) AS total_sold,
    SUM(oi.qty * oi.unit_price) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS order_count
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'Finalizado'
GROUP BY p.id, p.name, c.name, p.price
ORDER BY total_sold DESC NULLS LAST;

-- vista de riesgo de inventario
CREATE OR REPLACE VIEW vw_inventory_risk AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.stock AS current_stock,
    p.active,
    CASE 
        WHEN p.stock = 0 THEN 'Sin Stock'
        WHEN p.stock < 5 THEN 'Crítico'
        WHEN p.stock < 10 THEN 'Bajo'
        ELSE 'Normal'
    END AS stock_status,
    COALESCE(SUM(oi.qty), 0) AS total_sold_last_30_days
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id 
    AND o.status = 'Finalizado'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, c.name, p.stock, p.active
ORDER BY p.stock ASC, total_sold_last_30_days DESC;

-- vista de valor de clientes
CREATE OR REPLACE VIEW vw_customer_value AS
SELECT 
    cu.id AS customer_id,
    cu.name AS customer_name,
    cu.email,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(oi.qty * oi.unit_price), 0) AS total_spent,
    COALESCE(AVG(oi.qty * oi.unit_price), 0) AS avg_order_value,
    MIN(o.created_at) AS first_order,
    MAX(o.created_at) AS last_order
FROM customers cu
LEFT JOIN orders o ON cu.id = o.customer_id AND o.status = 'Finalizado'
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY cu.id, cu.name, cu.email
ORDER BY total_spent DESC;

-- vista de ventas por canal
CREATE OR REPLACE VIEW vw_sales_channel AS
SELECT 
    o.channel,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT o.customer_id) AS unique_customers,
    SUM(oi.qty * oi.unit_price) AS total_revenue,
    AVG(oi.qty * oi.unit_price) AS avg_order_value,
    SUM(oi.qty) AS total_items
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'Finalizado'
GROUP BY o.channel
ORDER BY total_revenue DESC;

-- vista de metodos de pago
CREATE OR REPLACE VIEW vw_payment_mix AS
SELECT 
    p.method,
    COUNT(p.id) AS total_payments,
    SUM(p.paid_amount) AS total_amount,
    ROUND(
        (SUM(p.paid_amount) * 100.0) / 
        NULLIF((SELECT SUM(paid_amount) FROM payments), 0), 
        2
    ) AS percentage
FROM payments p
GROUP BY p.method
ORDER BY total_amount DESC;
