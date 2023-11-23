import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { getReports, changeSalesStatusById, getReportsByUserId, getReportsByProductId, changeProductionStatusById, getReportsAwaitingPaymentByUserId } from "./reports.drizzle";
import { PaymentStatusZod, ProductionStatusZod, SalesStatusZod } from "$lib/validation/types.zod.typescript";
import { getSalesReports } from "./reports.drizzle";


export const reports = router({
    getReports: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getReports(input, ctx);
    }),
   
    getSalesReports: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getSalesReports(input, ctx);
    }),
    getReportsByUserId: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getReportsByUserId(input, ctx);
    }),
    getReportsAwaitingPaymentByUserId: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getReportsAwaitingPaymentByUserId(input, ctx);
    }),
    getReportsByProductId: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getReportsByProductId(input, ctx);
    }),
    changeSalesStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: SalesStatusZod,
        payment_status: PaymentStatusZod
    }))
        .query(async ({ input, ctx }) => {
            return await changeSalesStatusById(input, ctx);
        }),
    changeProductionStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: SalesStatusZod,
        payment_status: PaymentStatusZod,
        production_status: ProductionStatusZod
    }))
        .query(async ({ input, ctx }) => {
            return await changeProductionStatusById(input, ctx);
        }),
});