

import { trpcServer } from '$lib/server/server';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: 25 }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const [shopOrdersPromise] = await Promise.all([
        await trpcServer.reports.getDailyProductionReport.ssr(query, event)
    ]);

    return {
        results: shopOrdersPromise
    };
}) satisfies PageServerLoad;