import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from './schema/index';
import postgres from "postgres";
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("Database not found");
}

export const sql = postgres(connectionString, { max: 1, onnotice: () => {} })
export const db = drizzle(sql, { schema });