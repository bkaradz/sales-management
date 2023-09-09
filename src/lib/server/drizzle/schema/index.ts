import { bigint, boolean, integer, json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('auth_user', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  full_name: text('full_name').notNull(),
  active: boolean('active').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const key = pgTable('user_key', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  hashed_password: text('hashed_password'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const session = pgTable('user_session', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  active_expires: bigint('active_expires', { mode: 'number' }).notNull(),
  idle_expires: bigint('idle_expires', { mode: 'number' }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const contact = pgTable('contact', {
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

export const phone = pgTable('phone', {
  id: text('id').primaryKey(),
  contact_id: text('contact_id').notNull().references(() => contact.id),
  phone: varchar('phone', { length: 256 }).unique(),
})

export const email = pgTable('email', {
  id: text('id').primaryKey(),
  contact_id: text('contact_id').notNull().references(() => contact.id),
  email: text('email').unique(),
})

export const address = pgTable('address', {
  id: text('id').primaryKey(),
  contact_id: text('contact_id').notNull().references(() => contact.id),
  address: text('address'),
})

export const product = pgTable('product', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  product_category: text('product_category'),
  unit_price: json('unit_price'),
  stitches: integer('stitches'),
  quantity: integer('quantity'),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})