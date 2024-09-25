import { trpcServer } from '$lib/server/server';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {

    // const [pricelistPromise, exchangePromise, trpcPromise] = await Promise.all([
    //     await trpcServer.pricelists.getDefaultPricelists.ssr(event),
    //     await trpcServer.rates.getDefaultRates.ssr(event),
    //     await trpcServer.hydrateToClient(event),
    // ]);

    // return {
    //     trpc: trpcPromise,
    //     pricelists: pricelistPromise,
    //     exchangeRates: exchangePromise
    // };
    const [ trpcPromise] = await Promise.all([
        await trpcServer.hydrateToClient(event),
    ]);

    return {
        trpc: trpcPromise,
    };
}) satisfies LayoutServerLoad;
