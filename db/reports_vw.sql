-- Vista: vw_sales_daily
-- Descripcion: Resumen de ventas agrupadas por dia y canal de venta.
-- Grain: 1 fila por combinacion de fecha + canal.
-- Metricas: total_orders, unique_customers, total_revenue, total_items_sold, avg_ticket.
-- HAVING filtra solo dias con mas de 0 en revenue para evitar filas vacias.
-- VERIFY:
--   SELECT * FROM vw_sales_daily WHERE sale_date >= '2026-01-01' ORDER BY sale_date DESC LIMIT 5;
--   SELECT channel, SUM(total_revenue) FROM vw_sales_daily GROUP BY channel;

CREATE OR REPLACE VIEW vw_sales_daily AS
SELECT
    DATE(o.created_at) AS sale_date,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT o.customer_id) AS unique_customers,
    SUM(oi.qty * oi.unit_price) AS total_revenue,
    SUM(oi.qty) AS total_items_sold,
    ROUND(SUM(oi.qty * oi.unit_price) / NULLIF(COUNT(DISTINCT o.id), 0), 2) AS avg_ticket,
    o.channel
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'Finalizado'
GROUP BY DATE(o.created_at), o.channel
HAVING SUM(oi.qty * oi.unit_price) > 0
ORDER BY sale_date DESC;


-- Vista: vw_top_products_ranked
-- Descripcion: Ranking de productos por unidades vendidas usando Window Function RANK().
-- Grain: 1 fila por producto.
-- Metricas: product_name, category_name, unit_price, total_sold, total_revenue, order_count, product_rank.
-- Usa RANK() OVER para asignar ranking por revenue dentro de cada categoria.
-- HAVING filtra productos que tengan al menos 1 unidad vendida.
-- VERIFY:
--   SELECT * FROM vw_top_products_ranked WHERE product_rank <= 3 ORDER BY category_name, product_rank;
--   SELECT * FROM vw_top_products_ranked ORDER BY total_sold DESC LIMIT 10;

CREATE OR REPLACE VIEW vw_top_products_ranked AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.price AS unit_price,
    COALESCE(SUM(oi.qty), 0) AS total_sold,
    COALESCE(SUM(oi.qty * oi.unit_price), 0) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS order_count,
    RANK() OVER (PARTITION BY c.name ORDER BY COALESCE(SUM(oi.qty * oi.unit_price), 0) DESC) AS product_rank
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'Finalizado'
GROUP BY p.id, p.name, c.name, p.price
HAVING COALESCE(SUM(oi.qty), 0) >= 0
ORDER BY total_revenue DESC NULLS LAST;


-- Vista: vw_inventory_risk
-- Descripcion: Productos con evaluacion de riesgo de inventario basado en stock actual.
-- Grain: 1 fila por producto.
-- Metricas: current_stock, stock_status (CASE), total_sold_last_30_days, risk_pct.
-- Usa CASE para clasificar estado de stock y COALESCE para ventas sin datos.
-- VERIFY:
--   SELECT * FROM vw_inventory_risk WHERE stock_status IN ('Sin Stock', 'Critico');
--   SELECT stock_status, COUNT(*) FROM vw_inventory_risk GROUP BY stock_status;

CREATE OR REPLACE VIEW vw_inventory_risk AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.stock AS current_stock,
    p.active,
    CASE
        WHEN p.stock = 0 THEN 'Sin Stock'
        WHEN p.stock < 5 THEN 'Critico'
        WHEN p.stock < 10 THEN 'Bajo'
        ELSE 'Normal'
    END AS stock_status,
    COALESCE(SUM(oi.qty), 0) AS total_sold_last_30_days,
    ROUND(
        CASE WHEN p.stock = 0 THEN 100.0
             ELSE LEAST(COALESCE(SUM(oi.qty), 0)::NUMERIC / NULLIF(p.stock, 0) * 100, 100)
        END, 2
    ) AS risk_pct
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
    AND o.status = 'Finalizado'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, c.name, p.stock, p.active
ORDER BY p.stock ASC, total_sold_last_30_days DESC;


-- Vista: vw_customer_value
-- Descripcion: Valor de vida de cada cliente calculado mediante CTE.
-- Grain: 1 fila por cliente.
-- Metricas: total_orders, total_spent, avg_order_value, first_order, last_order.
-- Usa CTE (WITH) para pre-calcular totales por orden antes de agregar por cliente.
-- COALESCE maneja clientes sin ordenes.
-- VERIFY:
--   SELECT * FROM vw_customer_value ORDER BY total_spent DESC LIMIT 5;
--   SELECT COUNT(*) FROM vw_customer_value WHERE total_orders > 0;

CREATE OR REPLACE VIEW vw_customer_value AS
WITH order_totals AS (
    SELECT
        o.id AS order_id,
        o.customer_id,
        o.created_at,
        SUM(oi.qty * oi.unit_price) AS order_total
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.status = 'Finalizado'
    GROUP BY o.id, o.customer_id, o.created_at
)
SELECT
    cu.id AS customer_id,
    cu.name AS customer_name,
    cu.email,
    COUNT(ot.order_id) AS total_orders,
    COALESCE(SUM(ot.order_total), 0) AS total_spent,
    COALESCE(AVG(ot.order_total), 0) AS avg_order_value,
    MIN(ot.created_at) AS first_order,
    MAX(ot.created_at) AS last_order
FROM customers cu
LEFT JOIN order_totals ot ON cu.id = ot.customer_id
GROUP BY cu.id, cu.name, cu.email
ORDER BY total_spent DESC;


-- Vista: vw_sales_channel
-- Descripcion: Metricas de venta agrupadas por canal (Presencial, App Movil, Web).
-- Grain: 1 fila por canal.
-- Metricas: total_orders, unique_customers, total_revenue, avg_order_value, total_items.
-- VERIFY:
--   SELECT * FROM vw_sales_channel;
--   SELECT SUM(total_revenue) FROM vw_sales_channel;

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


-- Vista: vw_payment_mix
-- Descripcion: Distribucion de pagos por metodo con porcentaje del total.
-- Grain: 1 fila por metodo de pago.
-- Metricas: total_payments, total_amount, percentage.
-- VERIFY:
--   SELECT * FROM vw_payment_mix;
--   SELECT SUM(percentage) FROM vw_payment_mix;

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
