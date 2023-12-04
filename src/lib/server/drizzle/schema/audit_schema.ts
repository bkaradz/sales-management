import { dollars } from "../../../utility/calculateCart.util";
import { toSnapshot, type DineroSnapshot } from "dinero.js";
import { boolean, char, json, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
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