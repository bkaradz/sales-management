import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { exchangeRateToMapObj, pricelistToMapObj, type ExchangeRateCombinedMap } from '$lib/utility/monetary.util';
import type { DineroSnapshot } from 'dinero.js';
import type { PageServerLoad } from './$types';
import type { ExchangeRate, ExchangeRateDetails, Pricelist, PricelistDetails } from '$lib/server/drizzle/schema';
import type { PricelistCombinedMap } from '$lib/utility/calculateCart.util';

export const load = (async (event) => {
    let query = {}

    const limit = 7
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const contacts = async (query: any) => {
        return await router.createCaller(await createContext(event)).contacts.getContacts(query);
    };

    const pricelist = async () => {
        const pricelistArray = await router.createCaller(await createContext(event)).pricelists.getAllPricelists();

        if (!pricelistArray) throw new Error("Pricelists not found");

        const pricelistMap: PricelistCombinedMap[] = []

        pricelistArray.forEach((pricelist) => pricelistMap.push(pricelistToMapObj(pricelist)))

        return pricelistMap
    };

    const exchangeRate = async () => {
        const exchangeRateArray = await router.createCaller(await createContext(event)).rates.getAllRates();

        if (!exchangeRateArray) throw new Error("Exchange Rate not found");

        const eRateMap: ExchangeRateCombinedMap[] = []

        exchangeRateArray.forEach((eRate) => {
            eRateMap.push(exchangeRateToMapObj(eRate))
        })

        return eRateMap
    };

    return {
        results: contacts(query),
        pricelistAll: pricelist(),
        exchangeRateAll: exchangeRate()
    };
}) satisfies PageServerLoad;