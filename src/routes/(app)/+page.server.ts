import { createContext } from '$lib/server/context';
import { router } from '$lib/server/trpc';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    const [incomeToday, incomeMonth, incomeDailyTotals, incomeMonthTotals] = await Promise.all([
        await router.createCaller(await createContext(event)).dashboard.incomeToday(),
        await router.createCaller(await createContext(event)).dashboard.incomeMonth(),
        await router.createCaller(await createContext(event)).dashboard.incomeDailyTotals(),
        await router.createCaller(await createContext(event)).dashboard.incomeMonthTotals(),
    ]);

    return {
        incomeToday,
        incomeMonth,
        incomeDailyTotals,
        incomeMonthTotals
    };
}) satisfies PageServerLoad;