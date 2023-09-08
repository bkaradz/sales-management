import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
	schema: './src/lib/server/drizzle/schema/index.ts',
	driver: 'pg',
	out: './drizzle/migrations',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL || ''
	}
} satisfies Config;
