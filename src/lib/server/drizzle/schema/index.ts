import { bigint, boolean, integer, json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const users = pgTable('auth_user', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  full_name: text('full_name').notNull(),
  active: boolean('active').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users);
// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(users);
 

export const key = pgTable('user_key', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  hashed_password: text('hashed_password'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const insertKeySchema = createInsertSchema(key);
export const selectKeySchema = createSelectSchema(key);

export const session = pgTable('user_session', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  active_expires: bigint('active_expires', { mode: 'number' }).notNull(),
  idle_expires: bigint('idle_expires', { mode: 'number' }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const insertSessionSchema = createInsertSchema(session);
export const selectSessionSchema = createSelectSchema(session);

export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  full_name: text('full_name').notNull(),
  is_corporate: boolean('is_corporate').notNull().default(false),
  notes: text('notes'),
  vat_or_bp_number: text('vat_or_bp_number'),
  balance_due: json('balance_due'),
  total_receipts: json('total_receipts'),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);

export const phones = pgTable('phones', {
  id: text('id').primaryKey(),
  contact_id: text('contact_id').notNull().references(() => contacts.id),
  phone: varchar('phone', { length: 256 }).notNull().unique(),
})

export const insertPhoneSchema = createInsertSchema(phones);
export const selectPhoneSchema = createSelectSchema(phones);

export const emails = pgTable('emails', {
  id: text('id').primaryKey(),
  contact_id: text('contact_id').notNull().references(() => contacts.id),
  email: text('email').notNull().unique(),
})

export const insertEmailSchema = createInsertSchema(emails);
export const selectEmailSchema = createSelectSchema(emails);

export const address = pgTable('address', {
  id: text('id').primaryKey(),
  contact_id: text('contact_id').notNull().references(() => contacts.id),
  address: text('address').notNull(),
})

export const insertAddressSchema = createInsertSchema(address);
export const selectAddressSchema = createSelectSchema(address);

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  product_category: text('product_category').notNull(),
  unit_price: json('unit_price'),
  stitches: integer('stitches'),
  quantity: integer('quantity'),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);