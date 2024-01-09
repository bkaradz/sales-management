import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from "postgres";
import * as dotenv from 'dotenv';

dotenv.config();

const hostString = process.env.DB_HOST
const databaseString = process.env.DB_NAME
const usernameString = process.env.DB_USER
const passwordString = process.env.DB_PASSWORD

async function main() {

    console.info("migrations started......");

    const migrationClient = postgres({ 
        max: 1,  
        onnotice: () => {},
        host                 : hostString,            
        port                 : 5432,          
        database             : databaseString,            
        username             : usernameString,            
        password             : passwordString, 
    });
    await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle/migrations" })

    console.info("migrations finished......");
    process.exit(0)
}

main().catch((err) => {
    console.error(err);
    process.exit(0)
})