import type { EmbroideryTypeUnion, GarmentPlacementUnion, PaymentMethodUnion, PaymentStatusUnion, ProductCategoriesUnion, ProductionStatusUnion, SalesStatusUnion, currencyTypeUnion } from '../../../utility/lists.utility';
import { currencyType } from '../../../utility/lists.utility';
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { bigint, boolean, integer, numeric, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';


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

export const InsertUserSchema = createInsertSchema(users);
export const SelectUserSchema = createSelectSchema(users);


export const key = pgTable('user_key', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  hashed_password: text('hashed_password'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type Key = InferSelectModel<typeof key>;
export type NewKey = InferInsertModel<typeof key>;

export const InsertKeySchema = createInsertSchema(key);
export const SelectKeySchema = createSelectSchema(key);

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

export const InsertSessionSchema = createInsertSchema(session);
export const SelectSessionSchema = createSelectSchema(session);

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  active: boolean('active').notNull().default(true),
  full_name: text('full_name').notNull(),
  is_corporate: boolean('is_corporate').notNull().default(false),
  notes: text('notes'),
  vat_or_bp_number: text('vat_or_bp_number'),
  amount: numeric('amount', { precision: 100, scale: 10 }).notNull().default('0'),
  orders_totals: numeric('orders_totals', { precision: 100, scale: 10 }).notNull().default('0'),
  total_receipts: numeric('total_receipts', { precision: 100, scale: 10 }).notNull().default('0'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type Contacts = InferSelectModel<typeof contacts>;
export type NewContacts = InferInsertModel<typeof contacts>;

export const InsertContactSchema = createInsertSchema(contacts);
export const SelectContactSchema = createSelectSchema(contacts);

export const phones = pgTable('phones', {
  id: serial('id').primaryKey(),
  contact_id: integer('contact_id').notNull().references(() => contacts.id),
  phone: varchar('phone', { length: 256 }).notNull().unique(),
})

export type Phones = InferSelectModel<typeof phones>;
export type NewPhones = InferInsertModel<typeof phones>;

export const InsertPhoneSchema = createInsertSchema(phones);
export const SelectPhoneSchema = createSelectSchema(phones);

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  contact_id: integer('contact_id').notNull().references(() => contacts.id),
  email: text('email').notNull().unique(),
})

export type Emails = InferSelectModel<typeof emails>;
export type NewEmails = InferInsertModel<typeof emails>;

export const InsertEmailSchema = createInsertSchema(emails);
export const SelectEmailSchema = createSelectSchema(emails);

export const address = pgTable('address', {
  id: serial('id').primaryKey(),
  contact_id: integer('contact_id').notNull().references(() => contacts.id),
  address: text('address').notNull(),
})

export type Address = InferSelectModel<typeof address>;
export type NewAddress = InferInsertModel<typeof address>;

export const InsertAddressSchema = createInsertSchema(address);
export const SelectAddressSchema = createSelectSchema(address);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  product_category: text('product_category').$type<ProductCategoriesUnion>().notNull().default('Embroidery'),
  product_unit_price: numeric('product_unit_price', { precision: 100, scale: 10 }),
  stitches: integer('stitches'),
  stork_quantity: integer('stork_quantity'),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type Products = InferSelectModel<typeof products>;
export type NewProducts = InferInsertModel<typeof products>;

export const InsertProductSchema = createInsertSchema(products);
export const SelectProductSchema = createSelectSchema(products);


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

export const InsertPricelistSchema = createInsertSchema(pricelist);
export const SelectPricelistSchema = createSelectSchema(pricelist);

export const pricelist_details = pgTable('pricelist_details', {
  id: serial('id').primaryKey(),
  minimum_price: numeric('minimum_price', { precision: 100, scale: 10 }).notNull().default('0'),
  price_per_thousand_stitches: numeric('price_per_thousand_stitches', { precision: 100, scale: 10 }).notNull().default('0'),
  minimum_quantity: integer("minimum_quantity").default(0).notNull(),
  embroidery_types: text('embroidery_types').$type<EmbroideryTypeUnion>().notNull(),
  pricelist_id: integer('pricelist_id').notNull().references(() => pricelist.id),
})

export type PricelistDetails = InferSelectModel<typeof pricelist_details>;
export type NewPricelistDetails = InferInsertModel<typeof pricelist_details>;

export const InsertPricelistDetailsSchema = createInsertSchema(pricelist_details);
export const SelectPricelistDetailsSchema = createSelectSchema(pricelist_details);

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

export const InsertExchangeRateSchema = createInsertSchema(exchange_rates);
export const SelectExchangeRateSchema = createSelectSchema(exchange_rates);

export const currencyEnum = pgEnum('currency', currencyType);

export const exchange_rate_details = pgTable('exchange_rate_details', {
  id: serial('id').primaryKey(),
  exchange_rates_id: integer('exchange_rates_id').notNull().references(() => exchange_rates.id),
  name: text('name').notNull(),
  currency: currencyEnum('currency').notNull(),
  rate: numeric('rate', { precision: 100, scale: 10 }).notNull(),
})

export type ExchangeRateDetails = InferSelectModel<typeof exchange_rate_details>;
export type NewExchangeRateDetails = InferInsertModel<typeof exchange_rate_details>;

export const InsertExchangeRateDetailsSchema = createInsertSchema(exchange_rate_details);
export const SelectExchangeRateDetailsSchema = createSelectSchema(exchange_rate_details);

export const shop_orders = pgTable('shop_orders', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  customer_id: integer('customer_id').notNull().references(() => contacts.id),
  pricelist_id: integer('pricelist_id').notNull().references(() => pricelist.id),
  exchange_rates_id: integer('exchange_rates_id').notNull().references(() => exchange_rates.id),
  sales_status: text('sales_status').$type<SalesStatusUnion>().notNull().default('Quotation'),
  payment_status: text('payment_status').$type<PaymentStatusUnion>().notNull().default('Awaiting Sales Order'),
  sales_amount: numeric('sales_amount', { precision: 100, scale: 10 }).notNull(),
  total_products: integer('total_products').notNull(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  delivery_date: timestamp('delivery_date').notNull().default(sql`now() + INTERVAL '7 days'`),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export type Orders = InferSelectModel<typeof shop_orders>;
export type NewOrders = InferInsertModel<typeof shop_orders>;

export const InsertOrdersSchema = createInsertSchema(shop_orders);
export const SelectOrdersSchema = createSelectSchema(shop_orders);

export const orders_details = pgTable('orders_details', {
  id: serial('id').primaryKey(),
  shop_orders_id: integer('shop_orders_id').notNull().references(() => shop_orders.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  unit_price: numeric('unit_price', { precision: 100, scale: 10 }).notNull(),
  product_category: text('product_category').$type<ProductCategoriesUnion>().notNull().default('Embroidery'),
  stitches: integer('stitches'),
  active: boolean('active').notNull().default(true),
  price_calculated: boolean('price_calculated').notNull(),
  quantity: integer('quantity').notNull(),
  embroidery_type: text('embroidery_type').$type<EmbroideryTypeUnion>(),
  garment_placement: text('garment_placement').$type<GarmentPlacementUnion>(),
  production_status: text('production_status').$type<ProductionStatusUnion>().notNull().default('Received'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export type OrdersDetails = InferSelectModel<typeof orders_details>;
export type NewOrdersDetails = InferInsertModel<typeof orders_details>;

export const InsertOrdersDetailsSchema = createInsertSchema(orders_details);
export const SelectOrdersDetailsSchema = createSelectSchema(orders_details);

export const transactions_details = pgTable('transactions_details', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  transactions_id: integer('transactions_id').notNull().references(() => transactions.id),
  payments_id: integer('payments_id').notNull().references(() => payments.id),
  amount_paid: numeric('amount_paid', { precision: 100, scale: 10 }).notNull(),
  fully_paid: boolean('fully_paid').notNull().default(true),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export type TransactionsDetailsDetails = InferSelectModel<typeof transactions_details>;
export type NewTransactionsDetailsDetails = InferInsertModel<typeof transactions_details>;

export const InsertTransactionsDetailsSchema = createInsertSchema(transactions_details);
export const SelectTransactionsDetailsSchema = createSelectSchema(transactions_details);


export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  customer_id: integer('customer_id').notNull().references(() => contacts.id),
  shop_orders_id: integer('shop_orders_id').notNull().references(() => shop_orders.id),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export type TransactionDetails = InferSelectModel<typeof transactions>;
export type NewTransactionDetails = InferInsertModel<typeof transactions>;

export const InsertTransactionSchema = createInsertSchema(transactions);
export const SelectTransactionSchema = createSelectSchema(transactions);

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  customer_id: integer('customer_id').notNull().references(() => contacts.id),
  amount_tendered: numeric('amount_tendered', { precision: 100, scale: 10 }).notNull(),
  payment_method: text('payment_method').$type<PaymentMethodUnion>().notNull(),
  currency: text('currency').$type<currencyTypeUnion>().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export type PaymentsDetails = InferSelectModel<typeof payments>;
export type NewPaymentsDetails = InferInsertModel<typeof payments>;

export const InsertPaymentsSchema = createInsertSchema(payments);
export const SelectPaymentsSchema = createSelectSchema(payments);