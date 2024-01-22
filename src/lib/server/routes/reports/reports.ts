import { z } from "zod";
import { protectedProcedure, router } from "$lib/server/trpc";
import { getDailyProductionReport, getSalesReports } from "./reports.drizzle";


export const reports = router({
    getSalesReports: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getSalesReports(input, ctx);
    }),
    getDailyProductionReport: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getDailyProductionReport(input, ctx);
    }),
});