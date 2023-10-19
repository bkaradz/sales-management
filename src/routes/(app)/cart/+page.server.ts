import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

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
        return await router.createCaller(await createContext(event)).pricelists.getAllPricelists();
    };

    const exchangeRate = async () => {
        return await router.createCaller(await createContext(event)).rates.getAllRates();
    };

    return {
        results: contacts(query),
        pricelistAll: pricelist(),
        exchangeRateAll: exchangeRate()
    };
}) satisfies PageServerLoad;