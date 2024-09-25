

import { trpcServer } from '$lib/server/server';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const [shopOrdersPromise, contactPromise] = await Promise.all([
        await trpcServer.shop_orders.getOrdersByUserId.ssr({ ...query, id: parseInt(event.params.id, 10) }, event),
        await trpcServer.contacts.getById.ssr(parseInt(event.params.id, 10), event)
    ]);

    return {
        contact: contactPromise,
        shop_orders: shopOrdersPromise
    };
}) satisfies PageServerLoad;