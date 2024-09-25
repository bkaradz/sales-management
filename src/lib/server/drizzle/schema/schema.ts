import type { EmbroideryTypeUnion, GarmentPlacementUnion, PaymentMethodUnion, PaymentStatusUnion, ProductCategoriesUnion, ProductionStatusUnion, SalesStatusUnion, currencyTypeUnion } from '../../../utility/lists.utility';
import { currencyType } from '../../../utility/lists.utility';
import type { InferInsertModel, InferSelectModel, SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { text, integer, sqliteTable, blob, numeric } from "drizzle-orm/sqlite-core";
import { z } from 'zod';

const timestamp = {
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}


export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  active: integer('active', { mode: 'boolean' }).default(false).notNull(),
  ...timestamp
})

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export const InsertUserSchema = createInsertSchema(user);
export const SelectUserSchema = createSelectSchema(user);

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  expiresAt: integer("expires_at").notNull(),
  ...timestamp
})

export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export const InsertSessionSchema = createInsertSchema(session);
export const SelectSessionSchema = createSelectSchema(session);

export const contacts = sqliteTable('contacts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  fullName: text('full_name').notNull(),
  isCorporate: integer('is_corporate', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  vatOrBpNumber: text('vat_or_bp_number'),
  amount: numeric('amount').notNull().default('0'),
  ordersTotals: numeric('orders_totals').notNull().default('0'),
  totalReceipts: numeric('total_receipts').notNull().default('0'),
  ...timestamp
})

export type Contacts = InferSelectModel<typeof contacts>;
export type NewContacts = InferInsertModel<typeof contacts>;

export const InsertContactSchema = createInsertSchema(contacts);
export const SelectContactSchema = createSelectSchema(contacts);

export const phones = sqliteTable('phones', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  contactId: integer('contact_id').notNull().references(() => contacts.id),
  phone: text('phone', { length: 256 }).notNull().unique(),
})

export type Phones = InferSelectModel<typeof phones>;
export type NewPhones = InferInsertModel<typeof phones>;

export const InsertPhoneSchema = createInsertSchema(phones);
export const SelectPhoneSchema = createSelectSchema(phones);

export const emails = sqliteTable('emails', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  contactId: integer('contact_id').notNull().references(() => contacts.id),
  email: text('email').notNull().unique(),
})

export type Emails = InferSelectModel<typeof emails>;
export type NewEmails = InferInsertModel<typeof emails>;

export const InsertEmailSchema = createInsertSchema(emails);
export const SelectEmailSchema = createSelectSchema(emails);

export const address = sqliteTable('address', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  contactId: integer('contact_id').notNull().references(() => contacts.id),
  address: text('address').notNull(),
})

export type Address = InferSelectModel<typeof address>;
export type NewAddress = InferInsertModel<typeof address>;

export const InsertAddressSchema = createInsertSchema(address);
export const SelectAddressSchema = createSelectSchema(address);

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  productCategory: text('product_category').$type<ProductCategoriesUnion>().notNull().default('Embroidery'),
  productUnitPrice: numeric('product_unit_price'),
  stitches: integer('stitches'),
  storkQuantity: integer('stork_quantity'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamp
})

export type Products = InferSelectModel<typeof products>;
export type NewProducts = InferInsertModel<typeof products>;

export const InsertProductSchema = createInsertSchema(products);
export const SelectProductSchema = createSelectSchema(products);


export const pricelist = sqliteTable('pricelist', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  default: integer('default', { mode: 'boolean' }).notNull().default(false),
  ...timestamp
})

export type Pricelist = InferSelectModel<typeof pricelist>;
export type NewPricelist = InferInsertModel<typeof pricelist>;

export const InsertPricelistSchema = createInsertSchema(pricelist);
export const SelectPricelistSchema = createSelectSchema(pricelist);

export const pricelist_details = sqliteTable('pricelist_details', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  minimumPrice: numeric('minimum_price').notNull().default('0'),
  pricePerThousandStitches: numeric('price_per_thousand_stitches').notNull().default('0'),
  minimumQuantity: integer("minimum_quantity").default(0).notNull(),
  embroideryTypes: text('embroidery_types').$type<EmbroideryTypeUnion>().notNull(),
  pricelistId: integer('pricelist_id').notNull().references(() => pricelist.id),
})

export type PricelistDetails = InferSelectModel<typeof pricelist_details>;
export type NewPricelistDetails = InferInsertModel<typeof pricelist_details>;

export const InsertPricelistDetailsSchema = createInsertSchema(pricelist_details);
export const SelectPricelistDetailsSchema = createSelectSchema(pricelist_details);

export const exchange_rates = sqliteTable('exchange_rates', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  default: integer('default', { mode: 'boolean' }).notNull().default(true),
  ...timestamp
})

export type ExchangeRate = InferSelectModel<typeof exchange_rates>;
export type NewExchangeRate = InferInsertModel<typeof exchange_rates>;

export const InsertExchangeRateSchema = createInsertSchema(exchange_rates);
export const SelectExchangeRateSchema = createSelectSchema(exchange_rates);

export const exchange_rate_details = sqliteTable('exchange_rate_details', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  exchangeRatesId: integer('exchange_rates_id').notNull().references(() => exchange_rates.id),
  name: text('name').notNull(),
  currency: text('currency', {enum: currencyType}).notNull(),
  rate: numeric('rate').notNull(),
})

export type ExchangeRateDetails = InferSelectModel<typeof exchange_rate_details>;
export type NewExchangeRateDetails = InferInsertModel<typeof exchange_rate_details>;

export const InsertExchangeRateDetailsSchema = createInsertSchema(exchange_rate_details);
export const SelectExchangeRateDetailsSchema = createSelectSchema(exchange_rate_details);

export const shop_orders = sqliteTable('shop_orders', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  customerId: integer('customer_id').notNull().references(() => contacts.id),
  pricelistId: integer('pricelist_id').notNull().references(() => pricelist.id),
  exchangeRatesId: integer('exchange_rates_id').notNull().references(() => exchange_rates.id),
  salesStatus: text('sales_status').$type<SalesStatusUnion>().notNull().default('Quotation'),
  paymentStatus: text('payment_status').$type<PaymentStatusUnion>().notNull().default('Awaiting Sales Order'),
  salesAmount: numeric('sales_amount').notNull(),
  totalProducts: integer('total_products').notNull(),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  deliveryDate: text('delivery_date').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  ...timestamp
})

export type Orders = InferSelectModel<typeof shop_orders>;
export type NewOrders = InferInsertModel<typeof shop_orders>;

export const InsertOrdersSchema = createInsertSchema(shop_orders);
export const SelectOrdersSchema = createSelectSchema(shop_orders);

export const orders_details = sqliteTable('orders_details', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  shopOrdersId: integer('shop_orders_id').notNull().references(() => shop_orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  unitPrice: numeric('unit_price').notNull(),
  productCategory: text('product_category').$type<ProductCategoriesUnion>().notNull().default('Embroidery'),
  stitches: integer('stitches'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  priceCalculated: integer('price_calculated', { mode: 'boolean' }).notNull(),
  quantity: integer('quantity').notNull(),
  embroideryType: text('embroidery_type').$type<EmbroideryTypeUnion>(),
  garmentPlacement: text('garment_placement').$type<GarmentPlacementUnion>(),
  productionStatus: text('production_status').$type<ProductionStatusUnion>().notNull().default('Received'),
  ...timestamp
})

export type OrdersDetails = InferSelectModel<typeof orders_details>;
export type NewOrdersDetails = InferInsertModel<typeof orders_details>;

export const InsertOrdersDetailsSchema = createInsertSchema(orders_details);
export const SelectOrdersDetailsSchema = createSelectSchema(orders_details);

export const transactions_details = sqliteTable('transactions_details', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  transactionsId: integer('transactions_id').notNull().references(() => transactions.id),
  paymentsId: integer('payments_id').notNull().references(() => payments.id),
  amountPaid: numeric('amount_paid').notNull(),
  fullyPaid: integer('fully_paid', { mode: 'boolean' }).notNull().default(true),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamp
})

export type TransactionsDetails = InferSelectModel<typeof transactions_details>;
export type NewTransactionsDetails = InferInsertModel<typeof transactions_details>;

export const InsertTransactionsDetailsSchema = createInsertSchema(transactions_details);
export const SelectTransactionsDetailsSchema = createSelectSchema(transactions_details);


export const transactions = sqliteTable('transactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  customerId: integer('customer_id').notNull().references(() => contacts.id),
  shopOrdersId: integer('shop_orders_id').notNull().references(() => shop_orders.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamp
})

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export const InsertTransactionSchema = createInsertSchema(transactions);
export const SelectTransactionSchema = createSelectSchema(transactions);

export const payments = sqliteTable('payments', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  customerId: integer('customer_id').notNull().references(() => contacts.id),
  exchangeRateId: integer('exchange_rate_id').notNull().references(() => exchange_rates.id),
  defaultCurrencyEquivalentTotal: numeric('default_currency_equivalent_total').notNull(),
  ...timestamp
})

export type Payments = InferSelectModel<typeof payments>;
export type NewPayments = InferInsertModel<typeof payments>;

export const InsertPaymentsSchema = createInsertSchema(payments);
export const SelectPaymentsSchema = createSelectSchema(payments);

export const payments_details = sqliteTable('payments_details', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  paymentsId: integer('payments_id').notNull().references(() => payments.id),
  userId: text('userId').notNull().references(() => user.id),
  customerId: integer('customer_id').notNull().references(() => contacts.id),
  exchangeRateId: integer('exchange_rate_id').notNull().references(() => exchange_rates.id),
  defaultCurrencyEquivalent: numeric('default_currency_equivalent').notNull(),
  cashPaid: numeric('cash_paid').notNull(),
  paymentMethod: text('payment_method').$type<PaymentMethodUnion>().notNull(),
  currency: text('currency').$type<currencyTypeUnion>().notNull(),
  ...timestamp
})

export type PaymentsDetails = InferSelectModel<typeof payments_details>;
export type NewPaymentsDetails = Omit<InferInsertModel<typeof payments_details>, 'payments_id'>;

export const InsertPaymentsDetailsSchema = createInsertSchema(payments_details);
export const SelectPaymentsDetailsSchema = createSelectSchema(payments_details);

export const RequestInsertPaymentsDetailsSchema = InsertPaymentsDetailsSchema.omit({ payments_id: true })

export const expenses = sqliteTable('payments', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  name: integer('name').notNull().references(() => exchange_rates.id),
  amount: numeric('amount').notNull(),
  ...timestamp
})

export type Expenses = InferSelectModel<typeof expenses>;
export type NewExpenses = InferInsertModel<typeof expenses>;

export const InsertExpensesSchema = createInsertSchema(expenses);
export const SelectExpensesSchema = createSelectSchema(expenses);