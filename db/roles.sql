DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_pass';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE cafepro TO app_user;

GRANT USAGE ON SCHEMA public TO app_user;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;

GRANT SELECT ON vw_sales_daily TO app_user;
GRANT SELECT ON vw_top_products_ranked TO app_user;
GRANT SELECT ON vw_inventory_risk TO app_user;
GRANT SELECT ON vw_customer_value TO app_user;
GRANT SELECT ON vw_sales_channel TO app_user;
GRANT SELECT ON vw_payment_mix TO app_user;
