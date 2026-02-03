-- creamos el rol app_user si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_pass';
    END IF;
END
$$;

-- permiso para conectarse a la base de datos
GRANT CONNECT ON DATABASE cafepro TO app_user;

-- permiso para usar el schema public
GRANT USAGE ON SCHEMA public TO app_user;

-- quitamos permisos de las tablas por seguridad
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;

-- solo damos SELECT a las vistas, no a las tablas
GRANT SELECT ON vw_sales_daily TO app_user;
GRANT SELECT ON vw_top_products TO app_user;
GRANT SELECT ON vw_inventory_risk TO app_user;
GRANT SELECT ON vw_customer_value TO app_user;
GRANT SELECT ON vw_sales_channel TO app_user;
GRANT SELECT ON vw_payment_mix TO app_user;

-- asi el usuario solo puede leer las vistas y no puede tocar las tablas directamente
