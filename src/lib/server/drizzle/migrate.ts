import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from "postgres";
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL

async function main() {
    if (!connectionString) {
        throw new Error("Database not found");
    }

    console.info("migrations started......");

    const migrationClient = postgres(connectionString, { max: 1 });
    await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle/migrations" })

    console.info("migrations finished......");
    process.exit(0)
}

main().catch((err) => {
    console.error(err);
    process.exit(0)
})

/**
 * Products
 * CREATE INDEX products_index ON products (name, CAST(id AS text), CAST(stitches AS text) text_pattern_ops);
 * SELECT * FROM products WHERE (name ||' '|| CAST(id AS text) ||' '|| CAST(stitches AS text)) ILIKE('%1%');
 * Contacts
 * CREATE INDEX contacts_index ON contacts (full_name, CAST(id AS text) text_pattern_ops);
 * SELECT * FROM contacts WHERE (full_name ||' '|| CAST(id AS text)) ILIKE('%ab%');
 * 
 * 
 * -- Step 1: Create the function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the table
CREATE TABLE my_table (
  id SERIAL NOT NULL PRIMARY KEY,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create the trigger
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON my_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Step 4: Profit
-- Now we can insert and update rows in the table, and both 
-- the created_at and updated_at columns will be saved correctly :)

 * 
 * 
 * 
 * 
 * 
 */