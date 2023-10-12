import { pricelistsObj, reviver } from '$lib/data/pricelist';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {

    const session = await event.locals.auth.validate()

    let pricelist

    if (session) {


        // TODO: change to get values from database
        const pricelists = await router.createCaller(await createContext(event)).pricelists.getDefaultPricelists();
        console.log("🚀 ~ file: +layout.server.ts:18 ~ load ~ pricelists:", pricelists)
        // return JSON.parse(pricelistsObj, reviver); // dummy dat

        pricelist = pricelists
    }


    return {
        pricelists: pricelist
    };
}) satisfies LayoutServerLoad;