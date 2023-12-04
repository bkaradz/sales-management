import { dollars } from "../../../utility/calculateCart.util";
import { toSnapshot, type DineroSnapshot } from "dinero.js";
import { boolean, char, integer, json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./schema";


export const contacts_audit = pgTable('contacts_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id'),
  active: boolean('active'),
  full_name: text('full_name'),
  is_corporate: boolean('is_corporate'),
  notes: text('notes'),
  vat_or_bp_number: text('vat_or_bp_number'),
  deposit: json('deposit'),
  orders_totals: json('orders_totals'),
  total_receipts: json('total_receipts'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
})

export const phones_audit = pgTable('phones_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  contact_id: integer('contact_id'),
  phone: varchar('phone', { length: 256 }),
})

export const emails_audit = pgTable('emails_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  contact_id: integer('contact_id'),
  email: text('email'),
})

export const address_audit = pgTable('address_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  contact_id: integer('contact_id'),
  address: text('address'),
})

export const products_audit = pgTable('products_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id'),
  name: text('name'),
  description: text('description'),
  product_category: text('product_category'),
  product_unit_price: json('product_unit_price'),
  stitches: integer('stitches'),
  stork_quantity: integer('stork_quantity'),
  active: boolean('active'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
})

export const orders_audit = pgTable('orders_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id'),
  customer_id: integer('customer_id'),
  pricelist_id: integer('pricelist_id'),
  exchange_rates_id: integer('exchange_rates_id'),
  sales_status: text('sales_status'),
  payment_status: text('payment_status'),
  sales_amount: json('sales_amount'),
  total_products: integer('total_products'),
  description: text('description'),
  active: boolean('active'),
  delivery_date: timestamp('delivery_date'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at')
})

export const orders_details_audit = pgTable('orders_details_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  order_id: integer('order_id'),
  product_id: integer('product_id'),
  unit_price: json('unit_price'),
  total_price: json('total_price'),
  product_category: text('product_category'),
  stitches: integer('stitches'),
  active: boolean('active'),
  price_calculated: boolean('price_calculated'),
  quantity: integer('quantity'),
  embroidery_type: text('embroidery_type'),
  garment_placement: text('garment_placement'),
  production_status: text('production_status'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at')
})

export const transactions_details_audit = pgTable('transactions_details_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id'),
  orders_id: integer('orders_id'),
  transaction_id: integer('transaction_id'),
  active: boolean('active'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at')
})

export const transactions_audit = pgTable('transactions_audit', {
  op: char('op', { enum: ["D", "U", "I"] }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  user_to_blame: text('user_to_blame').notNull(),
  id: serial('id'),
  user_id: text('user_id'),
  customer_id: integer('customer_id'),
  amount_tendered: json('amount_tendered'),
  payment_method: text('payment_method'),
  active: boolean('active'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at')
})