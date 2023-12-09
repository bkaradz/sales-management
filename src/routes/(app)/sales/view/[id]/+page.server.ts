import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { pricelistToMapObj, type PricelistToMap, type ExchangeRateToMap, exchangeRateToMapObj } from '$lib/utility/monetary.util';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const order = async () => {
        return await router.createCaller(await createContext(event)).shop_orders.getById(parseInt(event.params.id, 10))
    };

    const pricelist = async () => {
        const pricelistArray = await router.createCaller(await createContext(event)).pricelists.getAllPricelists();

        if (!pricelistArray) throw new Error("Pricelists not found");

        const pricelistMap: PricelistToMap[] = []

        pricelistArray.forEach((pricelist) => pricelistMap.push(pricelistToMapObj(pricelist)))

        return pricelistMap
    };

    const exchangeRate = async () => {
        const exchangeRateArray = await router.createCaller(await createContext(event)).rates.getAllRates();

        if (!exchangeRateArray) throw new Error("Exchange Rate not found");

        const eRateMap: ExchangeRateToMap[] = []

        exchangeRateArray.forEach((eRate) => {
            eRateMap.push(exchangeRateToMapObj(eRate))
        })

        return eRateMap
    };

    return {
        results: order(),
        pricelistAll: pricelist(),
        exchangeRateAll: exchangeRate()
    };
}) satisfies PageServerLoad;