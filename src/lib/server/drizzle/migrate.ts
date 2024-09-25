import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./client";
import config from "../../../../drizzle.config";
import * as dotenv from 'dotenv';

dotenv.config();

migrate(db, {
    migrationsFolder: config.out || "",
});