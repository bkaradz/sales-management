import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {

    const [pricelistPromise, exchangePromise] = await Promise.all([
        await router.createCaller(await createContext(event)).pricelists.getDefaultPricelists(),
        await router.createCaller(await createContext(event)).rates.getDefaultRates(),
    ]);

    return {
        pricelists: pricelistPromise,
        exchangeRates: exchangePromise
    };
}) satisfies LayoutServerLoad;