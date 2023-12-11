import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {

    const pricelist = async () => {
        return await router.createCaller(await createContext(event)).pricelists.getDefaultPricelists();
    }

    const exchange = async () => {
        return await router.createCaller(await createContext(event)).rates.getDefaultRates()
    }

    return {
        pricelists: await pricelist(),
        exchangeRates: await exchange()
    };
}) satisfies LayoutServerLoad;