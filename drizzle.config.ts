import type { Config } from 'drizzle-kit';
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	schema: './src/lib/server/drizzle/schema/*',
	dialect: 'sqlite',
	out: './drizzle/migrations',
	dbCredentials: {
		host: process.env.DB_HOST || "",
    	user: process.env.DB_USER,
    	password: process.env.DB_PASSWORD,
    	database: process.env.DB_NAME || "",
		url: process.env.DB_URL,
	},
	verbose: true,
  	strict: true,
}) satisfies Config;
