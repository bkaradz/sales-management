import { toSnapshot, type DineroSnapshot, dinero, type Rates, type Currency } from "dinero.js";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { bigint, boolean, integer, json, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const dollars = (amount: number) => dinero({ amount, currency: { code: 'USD', base: 10, exponent: 2 }, scale: 3 });

export const users = pgTable('auth_user', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  full_name: text('full_name').notNull(),
  active: boolean('active').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

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

export type Key = InferSelectModel<typeof key>;
export type NewKey = InferInsertModel<typeof key>;

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

export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export const insertSessionSchema = createInsertSchema(session);
export const selectSessionSchema = createSelectSchema(session);

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  active: boolean('active').notNull().default(true),
  full_name: text('full_name').notNull(),
  is_corporate: boolean('is_corporate').notNull().default(false),
  notes: text('notes'),
  vat_or_bp_number: text('vat_or_bp_number'),
  balance_due: json('balance_due').$type<DineroSnapshot<number>>().notNull().default(toSnapshot(dollars(0))),
  total_receipts: json('total_receipts').$type<DineroSnapshot<number>>().notNull().default(toSnapshot(dollars(0))),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type Contacts = InferSelectModel<typeof contacts>;
export type NewContacts = InferInsertModel<typeof contacts>;

export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);

export const phones = pgTable('phones', {
  id: serial('id').primaryKey(),
  contact_id: integer('contact_id').notNull().references(() => contacts.id),
  phone: varchar('phone', { length: 256 }).notNull().unique(),
})

export type Phones = InferSelectModel<typeof phones>;
export type NewPhones = InferInsertModel<typeof phones>;

export const insertPhoneSchema = createInsertSchema(phones);
export const selectPhoneSchema = createSelectSchema(phones);

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  contact_id: integer('contact_id').notNull().references(() => contacts.id),
  email: text('email').notNull().unique(),
})

export type Emails = InferSelectModel<typeof emails>;
export type NewEmails = InferInsertModel<typeof emails>;

export const insertEmailSchema = createInsertSchema(emails);
export const selectEmailSchema = createSelectSchema(emails);

export const address = pgTable('address', {
  id: serial('id').primaryKey(),
  contact_id: integer('contact_id').notNull().references(() => contacts.id),
  address: text('address').notNull(),
})

export type Address = InferSelectModel<typeof address>;
export type NewAddress = InferInsertModel<typeof address>;

export const insertAddressSchema = createInsertSchema(address);
export const selectAddressSchema = createSelectSchema(address);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  product_category: text('product_category').notNull(),
  unit_price: json('minimum_price').$type<DineroSnapshot<number>>(),
  stitches: integer('stitches'),
  quantity: integer('quantity'),
  embroidery_type: text('embroidery_type').notNull().default('flat'),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type Products = InferSelectModel<typeof products>;
export type NewProducts = InferInsertModel<typeof products>;

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);


export const pricelist = pgTable('pricelist', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  default: boolean('default').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type Pricelist = InferSelectModel<typeof pricelist>;
export type NewPricelist = InferInsertModel<typeof pricelist>;

export const insertPricelistSchema = createInsertSchema(pricelist);
export const selectPricelistSchema = createSelectSchema(pricelist);

export const pricelist_details = pgTable('pricelist_details', {
  id: serial('id').primaryKey(),
  minimum_price: json('minimum_price').$type<DineroSnapshot<number>>().default(toSnapshot(dollars(0))),
  price_per_thousand_stitches: json('price_per_thousand_stitches').$type<DineroSnapshot<number>>().default(toSnapshot(dollars(0))),
  minimum_quantity: integer("minimum_quantity").default(0).notNull(),
  embroidery_types: text('embroidery_types').notNull(),
  pricelist_id: integer('pricelist_id').notNull().references(() => pricelist.id),
})

export type PricelistDetails = InferSelectModel<typeof pricelist_details>;
export type NewPricelistDetails = InferInsertModel<typeof pricelist_details>;

export const insertPricelistDetailsSchema = createInsertSchema(pricelist_details);
export const selectPricelistDetailsSchema = createSelectSchema(pricelist_details);

export const exchange_rates = pgTable('exchange_rates', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  default: boolean('default').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export type ExchangeRate = InferSelectModel<typeof exchange_rates>;
export type NewExchangeRate = InferInsertModel<typeof exchange_rates>;

export const insertExchangeRateSchema = createInsertSchema(exchange_rates);
export const selectExchangeRateSchema = createSelectSchema(exchange_rates);

export const exchange_rate_details = pgTable('exchange_rate_details', {
  id: serial('id').primaryKey(),
  exchange_rates_id: integer('exchange_rates_id').notNull().references(() => exchange_rates.id),
  name: text('name').notNull(),
  currency: text('currency').notNull(),
  currency_object: json('currency_object').$type<Currency<number>>().notNull(),
  rate: json('rate').$type<Rates<number>>().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export type ExchangeRateDetails = InferSelectModel<typeof exchange_rate_details>;
export type NewExchangeRateDetails = InferInsertModel<typeof exchange_rate_details>;

export const insertExchangeRateDetailsSchema = createInsertSchema(exchange_rate_details);
export const selectExchangeRateDetailsSchema = createSelectSchema(exchange_rate_details);