import { db } from "$lib/server/drizzle/client";
import { exchange_rates, exchange_rate_details, type ExchangeRate, type ExchangeRateDetails } from "$lib/server/drizzle/schema";
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

    const result = rateResults.reduce<Record<number, { exchange_rates: ExchangeRate; exchange_rate_details: ExchangeRateDetails[]; }>>(
      (acc, row) => {
        const exchange_rates = row.exchange_rates;
        const exchange_rate_details = row.exchange_rate_details;


        if (!acc[exchange_rates.id]) acc[exchange_rates.id] = { exchange_rates, exchange_rate_details: [] };

        if (exchange_rate_details) acc[exchange_rates.id].exchange_rate_details.push(exchange_rate_details);

        return acc;
      }, {},
    );

    const rateId = rateResults[0].exchange_rates.id

    return result[rateId]

  } catch (error) {

  }
}

export const getAllRates = async () => {

  try {

    const rateResults = await db.select({
      exchange_rates,
      exchange_rate_details
    }).from(exchange_rates)
      .leftJoin(exchange_rate_details, eq(exchange_rate_details.exchange_rates_id, exchange_rates.id))
      .where(eq(exchange_rates.active, true))

    const result = rateResults.reduce<Record<number, { exchange_rates: ExchangeRate; exchange_rate_details: ExchangeRateDetails[]; }>>(
      (acc, row) => {
        const exchange_rates = row.exchange_rates;
        const exchange_rate_details = row.exchange_rate_details;

        if (!acc[exchange_rates.id]) acc[exchange_rates.id] = { exchange_rates, exchange_rate_details: [] };

        if (exchange_rate_details) acc[exchange_rates.id].exchange_rate_details.push(exchange_rate_details);

        return acc;
      }, {},
    );

    return result

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

    const result = rateResults.reduce<Record<number, { exchange_rates: ExchangeRate; exchange_rate_details: ExchangeRateDetails[]; }>>(
      (acc, row) => {
        const exchange_rates = row.exchange_rates;
        const exchange_rate_details = row.exchange_rate_details;

        if (!acc[exchange_rates.id]) acc[exchange_rates.id] = { exchange_rates, exchange_rate_details: [] };

        if (exchange_rate_details) acc[exchange_rates.id].exchange_rate_details.push(exchange_rate_details);

        return acc;
      }, {},
    );

    return result[input]

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