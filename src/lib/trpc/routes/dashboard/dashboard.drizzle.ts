import { db } from "$lib/server/drizzle/client";
import { payments_details } from "$lib/server/drizzle/schema/schema";
import type { Context } from "$lib/trpc/context";
import type { currencyTypeUnion } from "$lib/utility/lists.utility";
import { error } from "@sveltejs/kit";
import currency from "currency.js";
import { eq, sql } from "drizzle-orm";



export const incomeToday = async (ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  try {

    const incomeToday = await db.select().from(payments_details).where(eq(sql`payments_details.created_at::timestamp::date`, sql`CURRENT_DATE`))

    const incomeTodayMap = new Map<currencyTypeUnion | 'Total Amount', string>()
    let totalAmount = '0'

    incomeToday.forEach((values) => {
      totalAmount = currency(totalAmount).add(values.default_currency_equivalent).toString()
      incomeTodayMap.set('Total Amount', totalAmount)

      if (incomeTodayMap.has(values.currency)) {
        incomeTodayMap.set(values.currency, currency(incomeTodayMap.get(values.currency) || '0').add(values.cash_paid).toString())
      } else {
        incomeTodayMap.set(values.currency, values.cash_paid)
      }
    })
    
    return incomeTodayMap

  } catch (error) {
    console.error("🚀 ~ file: dashboard.drizzle.ts:15 ~ incomeToday ~ error:", error)
  }

}

export const incomeWeekley = async (ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  try {

    const incomeToday = await db.select().from(payments_details).where(eq(sql`payments_details.created_at::timestamp::date`, sql`CURRENT_DATE`))

    const incomeTodayMap = new Map<currencyTypeUnion | 'Total Amount', string>()
    let totalAmount = '0'

    incomeToday.forEach((values) => {
      totalAmount = currency(totalAmount).add(values.default_currency_equivalent).toString()
      incomeTodayMap.set('Total Amount', totalAmount)

      if (incomeTodayMap.has(values.currency)) {
        incomeTodayMap.set(values.currency, currency(incomeTodayMap.get(values.currency) || '0').add(values.cash_paid).toString())
      } else {
        incomeTodayMap.set(values.currency, values.cash_paid)
      }
    })
    
    return incomeTodayMap

  } catch (error) {
    console.error("🚀 ~ file: dashboard.drizzle.ts:15 ~ incomeToday ~ error:", error)
  }

}

export const incomeMonth = async (ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  try {

    const incomeMonth = await db.select().from(payments_details).where(eq(sql`DATE_TRUNC('month', payments_details.created_at)`, sql`DATE_TRUNC('month', NOW())`))

    const incomeMonthMap = new Map<currencyTypeUnion | 'Total Amount', string>()
    let totalAmount = '0'

    incomeMonth.forEach((values) => {
      totalAmount = currency(totalAmount).add(values.default_currency_equivalent).toString()
      incomeMonthMap.set('Total Amount', totalAmount)

      if (incomeMonthMap.has(values.currency)) {
        incomeMonthMap.set(values.currency, currency(incomeMonthMap.get(values.currency) || '0').add(values.cash_paid).toString())
      } else {
        incomeMonthMap.set(values.currency, values.cash_paid)
      }
    })
    
    return incomeMonthMap

  } catch (error) {
    console.error("🚀 ~ file: dashboard.drizzle.ts:15 ~ incomeToday ~ error:", error)
  }

}