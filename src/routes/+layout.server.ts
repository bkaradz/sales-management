import { pricelistsObj, reviver } from '$lib/data/pricelist';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {

    const session = await event.locals.auth.validate()

    let pricelist

    if (session) {

        const pricelists = await router.createCaller(await createContext(event)).pricelists.getDefaultPricelists();

        pricelist = pricelists
    }


    return {
        pricelists: pricelist
    };
}) satisfies LayoutServerLoad;