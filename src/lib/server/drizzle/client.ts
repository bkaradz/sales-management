import { drizzle } from "drizzle-orm/postgres-js";
// import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from "postgres";
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("Database not found");
}

// for migrations
// const migrationClient = postgres(connectionString, { max: 1 });
// migrate(drizzle(migrationClient),)

export const sql = postgres(connectionString)
export const db = drizzle(sql);