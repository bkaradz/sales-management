import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from "postgres";
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL

// for migrations

async function main() {
    if (!connectionString) {
        throw new Error("Database not found");
    }

    console.log("migrations started......");

    const migrationClient = postgres(connectionString, { max: 1 });
    await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle/migrations" })

    console.log("migrations finished......");
    process.exit(0)
}

main().catch((err) => {
    console.log(err);
    process.exit(0)
})