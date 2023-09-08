import { bigint, boolean, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable('auth_user', {
  id: text('id').primaryKey(),
  username: text('username'),
  full_name: text('full_name'),
  active: boolean('active').notNull().default(false),
})

export const key = pgTable('user_key', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  hashed_password: text('hashed_password')
})

export const session = pgTable('user_session', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  active_expires: bigint('active_expires', { mode: 'number' }).notNull(),
  idle_expires: bigint('idle_expires', { mode: 'number' }).notNull()
})