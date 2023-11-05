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

    const orders = async (query: any) => {
        return await router.createCaller(await createContext(event)).orders.getOrdersByUserId({...query, id: parseInt(event.params.id, 10)});
    }

    const contact = async () => {
        return await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id, 10));
    };
    
    return {
        contact: contact(),
        orders: orders(query)
    };
}) satisfies PageServerLoad;