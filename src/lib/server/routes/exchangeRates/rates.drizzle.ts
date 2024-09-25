import { db } from "$lib/server/drizzle/client";
import { exchangeRates, exchangeRateDetails, type ExchangeRate, type ExchangeRateDetails } from "$lib/server/drizzle/schema/schema";
import type { Context } from "$lib/server/context";
import { exchangeRateToMapObj } from "$lib/utility/monetary.util";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const getDefaultRates = async () => {

  try {

    const rateResults = await db.select({
      exchangeRates,
      exchangeRateDetails
    }).from(exchangeRates)
      .leftJoin(exchangeRateDetails, eq(exchangeRateDetails.exchangeRatesId, exchangeRates.id))
      .where(eq(exchangeRates.default, true))

    const result = rateResults.reduce<Record<number, { exchangeRates: ExchangeRate; exchangeRateDetails: ExchangeRateDetails[]; }>>(
      (acc, row) => {
        const exchangeRates = row.exchangeRates;
        const exchangeRateDetails = row.exchangeRateDetails;


        if (!acc[exchangeRates.id]) acc[exchangeRates.id] = { exchangeRates, exchangeRateDetails: [] };

        if (exchangeRateDetails) acc[exchangeRates.id].exchangeRateDetails.push(exchangeRateDetails);

        return acc;
      }, {},
    );

    const rateId = rateResults[0].exchangeRates.id

    const exchangeRateMap = exchangeRateToMapObj(result[rateId])

    return exchangeRateMap

  } catch (error) {

  }
}

export const getAllRates = async (ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }


  try {

    const rateResults = await db.select({
      exchangeRates,
      exchangeRateDetails
    }).from(exchangeRates)
      .leftJoin(exchangeRateDetails, eq(exchangeRateDetails.exchangeRatesId, exchangeRates.id))
      .where(eq(exchangeRates.active, true))

    const result = rateResults.reduce<Record<number, { exchangeRates: ExchangeRate; exchangeRateDetails: ExchangeRateDetails[]; }>>(
      (acc, row) => {
        const exchangeRates = row.exchangeRates;
        const exchangeRateDetails = row.exchangeRateDetails;

        if (!acc[exchangeRates.id]) acc[exchangeRates.id] = { exchangeRates, exchangeRateDetails: [] };

        if (exchangeRateDetails) acc[exchangeRates.id].exchangeRateDetails.push(exchangeRateDetails);

        return acc;
      }, {},
    );

    return Object.values(result)

  } catch (error) {

  }
}

export type ratesAll = NonNullable<Awaited<ReturnType<typeof getAllRates>>>

export const getById = async (input: number, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    const rateResults = await db.select({
      exchangeRates,
      exchangeRateDetails
    }).from(exchangeRates)
      .leftJoin(exchangeRateDetails, eq(exchangeRateDetails.exchangeRatesId, exchangeRates.id))
      .where(eq(exchangeRates.id, input))

    const result = rateResults.reduce<Record<number, { exchangeRates: ExchangeRate; exchangeRateDetails: ExchangeRateDetails[]; }>>(
      (acc, row) => {
        const exchangeRates = row.exchangeRates;
        const exchangeRateDetails = row.exchangeRateDetails;

        if (!acc[exchangeRates.id]) acc[exchangeRates.id] = { exchangeRates, exchangeRateDetails: [] };

        if (exchangeRateDetails) acc[exchangeRates.id].exchangeRateDetails.push(exchangeRateDetails);

        return acc;
      }, {},
    );

    return result[input]

  } catch (error) {

  }
}

export const deleteById = async (input: number, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }


  try {

    await db.update(exchangeRates)
      .set({ active: false })
      .where(eq(exchangeRates.id, input));

    return {
      message: "success",
    }

  } catch (error) {

  }
}

export const createRate = async (input: any, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    const defaultRate = input?.default == 'on' ? true : false

    const descriptionRate = input?.description || null

    const rateResult = await db.insert(exchangeRates).values({ userId: ctx.session.user.userId, default: defaultRate, description: descriptionRate, }).returning({ id: exchangeRates.id });

    input.exchangeRateDetails.forEach(async (item: any) => {
      await db.insert(exchangeRateDetails).values({ exchangeRatesId: rateResult[0].id, ...item })
    })

    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: rates.drizzle.ts:99 ~ createRate ~ error:", error)
  }

};