import { db } from "$lib/server/drizzle/client";
import { exchange_rates, exchange_rate_details } from "$lib/server/drizzle/schema";
import type { Context } from "$lib/trpc/context";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const getDefaultRates = async () => {

  try {

    const rateResults = await db.select({
      exchange_rates,
      exchange_rate_details
    }).from(exchange_rates)
      .leftJoin(exchange_rate_details, eq(exchange_rate_details.exchange_rates_id, exchange_rates.id))
      .where(eq(exchange_rates.default, true))

    return rateResults[0]

  } catch (error) {

  }
}

export const getAllRates = async () => {

  try {

    const rateResults = await db.select({
      exchange_rates,
      exchange_rate_details
    }).from(exchange_rates)
      .leftJoin(exchange_rates, eq(exchange_rate_details.exchange_rates_id, exchange_rates.id))
      .where(eq(exchange_rates.active, true))

    return rateResults

  } catch (error) {

  }
}

export const getById = async (input: number) => {

  try {

    const rateResults = await db.select({
      exchange_rates,
      exchange_rate_details
    }).from(exchange_rates)
      .leftJoin(exchange_rate_details, eq(exchange_rate_details.exchange_rates_id, exchange_rates.id))
      .where(eq(exchange_rates.id, input))

    return rateResults[0]

  } catch (error) {

  }
}

export const deleteById = async (input: number) => {

  try {

      await db.update(exchange_rates)
			.set({ active: false })
			.where(eq(exchange_rates.id, input));

    return {
			message: "success",
		}

  } catch (error) {

  }
}

export const createRate = async (input: any, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

    const defaultRate = input?.default == 'on' ? true : false

    const descriptionRate = input?.description || null

		const rateResult = await db.insert(exchange_rates).values({ user_id: ctx.session.user.userId, default: defaultRate, description: descriptionRate, }).returning({ id: exchange_rates.id });

			input.exchange_rate_details.forEach(async (item: any) => {
				await db.insert(exchange_rate_details).values({ exchange_rates_id: rateResult[0].id, ...item })
			})

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: rates.drizzle.ts:99 ~ createRate ~ error:", error)
	}

};