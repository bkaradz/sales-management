

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

    const [productPromise, shopOrdersPromise] = await Promise.all([
        await trpcServer.products.getById.ssr(parseInt(event.params.id, 10), event),
        await trpcServer.shop_orders.getOrdersByProductId.ssr({ ...query, productId: parseInt(event.params.id, 10) }, event),
    ]);

    return {
        product: productPromise,
        shop_orders: shopOrdersPromise
    };
}) satisfies PageServerLoad;