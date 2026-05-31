CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_customer_full_name_trgm
  ON "customer"
  USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customer_email_trgm
  ON "customer"
  USING GIN (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customer_phone_number_trgm
  ON "customer"
  USING GIN (phone_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_employee_full_name_trgm
  ON "employee"
  USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_employee_email_trgm
  ON "employee"
  USING GIN (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_employee_phone_number_trgm
  ON "employee"
  USING GIN (phone_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_product_product_name_trgm
  ON "product"
  USING GIN (product_name gin_trgm_ops);