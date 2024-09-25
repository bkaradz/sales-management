import { trpcServer } from '$lib/server/server';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
/**
 * 
 
    const [incomeToday, incomeMonth, incomeDailyTotals, incomeMonthTotals] = await Promise.all([
        await trpcServer.dashboard.incomeToday.ssr(event),
        await trpcServer.dashboard.incomeMonth.ssr(event),
        await trpcServer.dashboard.incomeDailyTotals.ssr(event),
        await trpcServer.dashboard.incomeMonthTotals.ssr(event),
    ]);

    return {
        incomeToday,
        incomeMonth,
        incomeDailyTotals,
        incomeMonthTotals
    };
    */
    return {}
}) satisfies PageServerLoad;