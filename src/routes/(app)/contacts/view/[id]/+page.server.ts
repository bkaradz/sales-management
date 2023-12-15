import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
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
        await router.createCaller(await createContext(event)).shop_orders.getOrdersByUserId({ ...query, id: parseInt(event.params.id, 10) }),
        await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id, 10)),
    ]);

    return {
        contact: contactPromise,
        shop_orders: shopOrdersPromise
    };
}) satisfies PageServerLoad;