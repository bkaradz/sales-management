import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: 25 }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const shop_orders = async (query: any) => {
        return await router.createCaller(await createContext(event)).reports.getSalesReports(query);
    };

    return {
        results: shop_orders(query)
    };
}) satisfies PageServerLoad;