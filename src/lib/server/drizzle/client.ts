import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from './schema/schema';
import postgres from "postgres";
import * as dotenv from 'dotenv';

dotenv.config();

const hostString = process.env.DB_HOST
const databaseString = process.env.DB_NAME
const usernameString = process.env.DB_USER
const passwordString = process.env.DB_PASSWORD

export const sql = postgres({
    host                 : hostString,            
    port                 : 5432,          
    database             : databaseString,            
    username             : usernameString,            
    password             : passwordString, 
})
export const db = drizzle(sql, { schema });