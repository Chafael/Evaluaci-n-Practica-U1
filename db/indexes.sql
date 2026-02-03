-- index para buscar ordenes por fecha
CREATE INDEX idx_orders_date ON orders(created_at);

-- index para filtrar productos por categoria
CREATE INDEX idx_products_category ON products(category_id);

-- index para buscar ordenes de un cliente
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- estos los agregue para que las vistas corran mas rapido
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_active ON products(active) WHERE active = TRUE;
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
