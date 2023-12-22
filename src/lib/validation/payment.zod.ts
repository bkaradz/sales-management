import { RequestInsertPaymentsDetailsSchema } from '$lib/server/drizzle/schema/schema';
import { z } from 'zod';

export const savePaymentSchema = z
  .object({
    payments_details: z.array(RequestInsertPaymentsDetailsSchema),
    selected_orders_total: z.string(),
    selected_orders_ids: z.array(z.number()),
    customer_id: z.number(),
  })

export type SavePayment = z.infer<typeof savePaymentSchema>;
export type SavePaymentKeys = keyof SavePayment;
