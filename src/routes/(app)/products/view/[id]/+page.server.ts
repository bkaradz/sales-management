import { createContext } from '$lib/server/context';
import { router } from '$lib/server/trpc';
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
        await router.createCaller(await createContext(event)).products.getById(parseInt(event.params.id, 10)),
        await router.createCaller(await createContext(event)).shop_orders.getOrdersByProductId({ ...query, product_id: parseInt(event.params.id, 10) }),
    ]);

    return {
        product: productPromise,
        shop_orders: shopOrdersPromise
    };
}) satisfies PageServerLoad;