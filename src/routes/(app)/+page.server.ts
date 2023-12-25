import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    const [incomeToday, incomeMonth] = await Promise.all([
        await router.createCaller(await createContext(event)).dashboard.incomeToday(),
        await router.createCaller(await createContext(event)).dashboard.incomeMonth()
    ]);

    return {
        incomeToday,
        incomeMonth
    };
}) satisfies PageServerLoad;