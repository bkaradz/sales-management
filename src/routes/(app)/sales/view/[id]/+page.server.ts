import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const order = async () => {
        // return await router.createCaller(await createContext(event)).orders.getById(parseInt(event.params.id, 10));
        return await router.createCaller(await createContext(event)).orders.getById(parseInt(event.params.id, 10))
    };
    return {
        results: order()
    };
}) satisfies PageServerLoad;