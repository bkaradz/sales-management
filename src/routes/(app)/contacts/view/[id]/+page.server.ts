import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const contact = async () => {
        return await router
            .createCaller(await createContext(event))
            .contacts.getById(parseInt(event.params.id, 10));
    };
    return {
        results: contact()
    };
}) satisfies PageServerLoad;