import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, blob, numeric } from "drizzle-orm/sqlite-core";


export const contacts_audit = sqliteTable('contacts_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull(),
  fullName: text('fullName').notNull(),
  isCorporate: integer('is_corporate', { mode: 'boolean' }).notNull(),
  notes: text('notes'),
  vatOrBpNumber: text('vat_or_bp_number'),
  amount: numeric('amount').notNull(),
  ordersTotals: numeric('orders_totals').notNull(),
  totalReceipts: numeric('total_receipts').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
})

export const phones_audit = sqliteTable('phones_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  contactId: integer('contact_id').notNull(),
  phone: text('phone', { length: 256 }).notNull(),
})

export const emails_audit = sqliteTable('emails_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  contactId: integer('contact_id').notNull(),
  email: text('email').notNull(),
})

export const address_audit = sqliteTable('address_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  contactId: integer('contact_id').notNull(),
  address: text('address').notNull(),
})

export const products_audit = sqliteTable('products_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  productCategory: text('product_category').notNull(),
  productUnitPrice: numeric('product_unit_price'),
  stitches: integer('stitches'),
  storkQuantity: integer('stork_quantity'),
  active: integer('active', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
})

export const shop_orders_audit = sqliteTable('shop_orders_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  customerId: integer('customer_id').notNull(),
  pricelistId: integer('pricelist_id').notNull(),
  exchangeRatesId: integer('exchange_rates_id').notNull(),
  salesStatus: text('sales_status').notNull(),
  paymentStatus: text('payment_status').notNull(),
  salesAmount: numeric('sales_amount').notNull(),
  totalProducts: integer('total_products').notNull(),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull(),
  deliveryDate: text('delivery_date').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
})

export const orders_details_audit = sqliteTable('orders_details_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  shopOrdersId: integer('shop_orders_id').notNull(),
  productId: integer('product_id').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  productCategory: text('product_category').notNull(),
  stitches: integer('stitches'),
  active: integer('active', { mode: 'boolean' }).notNull(),
  price_calculated: integer('price_calculated', { mode: 'boolean' }).notNull(),
  quantity: integer('quantity').notNull(),
  embroideryType: text('embroidery_type'),
  garmentPlacement: text('garment_placement'),
  productionStatus: text('production_status').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
})

export const transactions_details_audit = sqliteTable('transactions_details_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  transactionsId: integer('transactions_id').notNull(),
  paymentsId: integer('payments_id').notNull(),
  amountPaid: numeric('amount_paid').notNull(),
  fullyPaid: integer('fully_paid', { mode: 'boolean' }).notNull(),
  active: integer('active', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
})

export const transactions_audit = sqliteTable('transactions_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  customerId: integer('customer_id').notNull(),
  shopOrdersId: integer('shop_orders_id').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
})


export const payments_audit = sqliteTable('payments_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  timestamp: text('timestamp').notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  customerId: integer('customer_id').notNull(),
  exchangeRateId: integer('exchange_rate_id'),
  defaultCurrencyEquivalentTotal: numeric('default_currency_equivalent_total').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
})

export const payments_details_audit = sqliteTable('payments_details_audit', {
  op: text('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userToBlame: text('user_to_blame').notNull(),
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  paymentsId: integer('payments_id').notNull(),
  userId: text('user_id').notNull(),
  customerId: integer('customer_id').notNull(),
  exchangeRateId: integer('exchange_rate_id').notNull(),
  defaultCurrencyEquivalent: numeric('default_currency_equivalent').notNull(),
  cashPaid: numeric('cash_paid').notNull(),
  paymentMethod: text('payment_method').notNull(),
  currency: text('currency').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
})