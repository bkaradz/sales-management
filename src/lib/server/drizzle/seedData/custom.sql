-- Custom SQL migration file, put you code below! --
-- Products search index
CREATE INDEX products_index ON products (name, CAST(id AS text), CAST(stitches AS text) text_pattern_ops);

-- Contacts search index
CREATE INDEX contacts_index ON contacts (full_name, CAST(id AS text) text_pattern_ops);

-- Create upates_at function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_session, auth_user, user_key, contacts, products, pricelist, exchange_rates, orders, orders_details
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
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON orders_details
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();