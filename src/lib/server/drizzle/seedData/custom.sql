-- Custom SQL migration file, put you code below! --
-- Products search index
CREATE INDEX products_index ON products (name, CAST(id AS text), CAST(stitches AS text) text_pattern_ops);

-- Contacts search index
CREATE INDEX contacts_index ON contacts (full_name, CAST(id AS text) text_pattern_ops);

-- Create updates_at function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

-- user_session, auth_user, user_key, contacts, products, pricelist, exchange_rates, shop_orders, orders_details
-- Create trigger
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON user_session
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON auth_user
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON user_key
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON pricelist
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON shop_orders
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON orders_details
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE FUNCTION universal_audit_information() 
  RETURNS trigger AS  
  $$
  BEGIN
  IF (TG_OP = 'DELETE') THEN
    EXECUTE format('INSERT INTO %I SELECT ''D'', current_timestamp, %L, ($1::%I.%I).*', TG_ARGV[0], current_user, TG_TABLE_SCHEMA, TG_TABLE_NAME) USING OLD;
  elsif (TG_OP = 'UPDATE') THEN
    EXECUTE format('INSERT INTO %I SELECT ''U'', current_timestamp, %L, ($1::%I.%I).*', TG_ARGV[0], current_user, TG_TABLE_SCHEMA, TG_TABLE_NAME) USING NEW;
  elsif (TG_OP = 'INSERT') THEN
    EXECUTE format('INSERT INTO %I SELECT ''I'', current_timestamp, %L, ($1::%I.%I).*', TG_ARGV[0], current_user, TG_TABLE_SCHEMA, TG_TABLE_NAME) USING NEW;
  END IF;
  RETURN null;
  END;
  $$
  LANGUAGE plpgsql;

CREATE TRIGGER contacts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('contacts_audit');

CREATE TRIGGER phones_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON phones
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('phones_audit');

CREATE TRIGGER emails_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON emails
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('emails_audit');

CREATE TRIGGER address_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON address
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('address_audit');

CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('products_audit');

CREATE TRIGGER shop_orders_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shop_orders
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('shop_orders_audit');

CREATE TRIGGER orders_details_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders_details
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('orders_details_audit');

-- CREATE TRIGGER transactions_details_audit_trigger
--   AFTER INSERT OR UPDATE OR DELETE ON transactions_details
--   FOR each ROW
--   EXECUTE PROCEDURE universal_audit_information('transactions_details_audit');

CREATE TRIGGER transactions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('transactions_audit');

CREATE TRIGGER payments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR each ROW
  EXECUTE PROCEDURE universal_audit_information('payments_audit');