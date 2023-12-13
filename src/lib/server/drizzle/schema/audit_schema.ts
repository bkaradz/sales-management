import { boolean, char, integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";


export const contacts_audit = pgTable('contacts_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id').notNull(),
  active: boolean('active').notNull(),
  full_name: text('full_name').notNull(),
  is_corporate: boolean('is_corporate').notNull(),
  notes: text('notes'),
  vat_or_bp_number: text('vat_or_bp_number'),
  amount: numeric('amount', { precision: 100, scale: 10 }).notNull(),
  orders_totals: numeric('orders_totals', { precision: 100, scale: 10 }).notNull(),
  total_receipts: numeric('total_receipts', { precision: 100, scale: 10 }).notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
})

export const phones_audit = pgTable('phones_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  contact_id: integer('contact_id').notNull(),
  phone: varchar('phone', { length: 256 }).notNull(),
})

export const emails_audit = pgTable('emails_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  contact_id: integer('contact_id').notNull(),
  email: text('email').notNull(),
})

export const address_audit = pgTable('address_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  contact_id: integer('contact_id').notNull(),
  address: text('address').notNull(),
})

export const products_audit = pgTable('products_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  product_category: text('product_category').notNull(),
  product_unit_price: numeric('product_unit_price', { precision: 100, scale: 10 }),
  stitches: integer('stitches'),
  stork_quantity: integer('stork_quantity'),
  active: boolean('active').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
})

export const shop_orders_audit = pgTable('shop_orders_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id').notNull(),
  customer_id: integer('customer_id').notNull(),
  pricelist_id: integer('pricelist_id').notNull(),
  exchange_rates_id: integer('exchange_rates_id').notNull(),
  sales_status: text('sales_status').notNull(),
  payment_status: text('payment_status').notNull(),
  sales_amount: numeric('sales_amount', { precision: 100, scale: 10 }).notNull(),
  total_products: integer('total_products').notNull(),
  description: text('description'),
  active: boolean('active').notNull(),
  delivery_date: timestamp('delivery_date').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull()
})

export const orders_details_audit = pgTable('orders_details_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  shop_orders_id: integer('shop_orders_id').notNull(),
  product_id: integer('product_id').notNull(),
  unit_price: numeric('unit_price', { precision: 100, scale: 10 }).notNull(),
  product_category: text('product_category').notNull(),
  stitches: integer('stitches'),
  active: boolean('active').notNull(),
  price_calculated: boolean('price_calculated').notNull(),
  quantity: integer('quantity').notNull(),
  embroidery_type: text('embroidery_type'),
  garment_placement: text('garment_placement'),
  production_status: text('production_status').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull()
})

export const transactions_details_audit = pgTable('transactions_details_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id').notNull(),
  transactions_id: integer('transactions_id').notNull(),
  payments_id: integer('payments_id').notNull(),
  amount_paid: numeric('amount_paid', { precision: 100, scale: 10 }).notNull(),
  fully_paid: boolean('fully_paid').notNull(),
  active: boolean('active').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull()
})

export const transactions_audit = pgTable('transactions_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id').notNull(),
  customer_id: integer('customer_id').notNull(),
  shop_orders_id: integer('shop_orders_id').notNull(),
  active: boolean('active').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull()
})


export const payments_audit = pgTable('payments_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id').notNull(),
  customer_id: integer('customer_id').notNull(),
  amount_tendered: numeric('amount_tendered', { precision: 100, scale: 10 }).notNull(),
  payment_method: text('payment_method').notNull(),
  currency: text('currency').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull()
})