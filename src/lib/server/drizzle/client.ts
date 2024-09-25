import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

import sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as dotenv from 'dotenv';
import { session, user } from "../drizzle/schema/schema";

dotenv.config();

// const sqliteDB = sqlite(":memory:");
const sqliteDB = new sqlite(process.env.DB_URL);
export const db = drizzle(sqliteDB);

export const adapter = new DrizzleSQLiteAdapter(db, session, user);

export interface DatabaseUser {
	id: string;
	username: string;
	password_hash: string;
	fullName: string;
	active: number;
}