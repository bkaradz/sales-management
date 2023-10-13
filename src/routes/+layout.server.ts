import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { exchangeRateMapObj, pricelistMapObj } from '$lib/utility/monetary.util';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {

    const session = await event.locals.auth.validate()

    let pricelists
    let exchangeRates

    if (session) {

        const pricelistResults = await router.createCaller(await createContext(event)).pricelists.getDefaultPricelists();
        const exchangeRateResults = await router.createCaller(await createContext(event)).rates.getDefaultRates()

        if (pricelistResults) {
            pricelists = pricelistMapObj(pricelistResults)
        }
        if (exchangeRateResults) {
            exchangeRates = exchangeRateMapObj(exchangeRateResults)
        }
    }

    return {
        pricelists,
        exchangeRates
    };
}) satisfies LayoutServerLoad;