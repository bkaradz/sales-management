import { createContext } from '$lib/server/context';
import { router } from '$lib/server/trpc';
import type { ratesAll } from '$lib/server/routes/exchangeRates/rates.drizzle';
import type { PricelistsAll } from '$lib/server/routes/pricelist/pricelists.drizzle';
import { pricelistToMapObj, type PricelistToMap, type ExchangeRateToMap, exchangeRateToMapObj } from '$lib/utility/monetary.util';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    const pricelist = (pricelistArray: PricelistsAll | undefined) => {

        if (!pricelistArray) throw new Error("Pricelists not found");

        const pricelistMap: PricelistToMap[] = []

        pricelistArray.forEach((pricelist) => pricelistMap.push(pricelistToMapObj(pricelist)))

        return pricelistMap
    };

    const exchangeRate = (exchangeRateArray: ratesAll | undefined) => {

        if (!exchangeRateArray) throw new Error("Exchange Rate not found");

        const eRateMap: ExchangeRateToMap[] = []

        exchangeRateArray.forEach((eRate) => {
            eRateMap.push(exchangeRateToMapObj(eRate))
        })

        return eRateMap
    };

    const [shopOrdersPromise, pricelistPromise, ratesPromise] = await Promise.all([
        await router.createCaller(await createContext(event)).shop_orders.getById(parseInt(event.params.id, 10)),
        await router.createCaller(await createContext(event)).pricelists.getAllPricelists(),
        await router.createCaller(await createContext(event)).rates.getAllRates()
    ]);

    return {
        results: shopOrdersPromise,
        pricelistAll: pricelist(pricelistPromise),
        exchangeRateAll: exchangeRate(ratesPromise)
    };
}) satisfies PageServerLoad;