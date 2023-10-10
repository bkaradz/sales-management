import { pricelistsObj, reviver } from '$lib/data/pricelist';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
    const pricelists = async () => {
        // TODO: change to get values from database
        // return await router.createCaller(await createContext(event)).contacts.getContacts(query);
        return JSON.parse(pricelistsObj, reviver); // dummy data
    }
    return {
        pricelists: pricelists()
    };
}) satisfies LayoutServerLoad;