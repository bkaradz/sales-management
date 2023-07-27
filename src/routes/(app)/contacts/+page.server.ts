import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const contacts = async () => {
		return await router.createCaller(await createContext(event)).contacts.getContacts({});
	};
    return {
        contacts: contacts()
    };
}) satisfies PageServerLoad;