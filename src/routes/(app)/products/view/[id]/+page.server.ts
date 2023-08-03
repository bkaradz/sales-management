import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const product = async () => {
        return await router
            .createCaller(await createContext(event))
            .products.getById(parseInt(event.params.id, 10));
    };
    return {
        product: product()
    };
}) satisfies PageServerLoad;