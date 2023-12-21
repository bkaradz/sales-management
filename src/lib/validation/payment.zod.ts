import { InsertPaymentsSchema } from '$lib/server/drizzle/schema/schema';
import { z } from 'zod';

export const savePaymentSchema = z
  .object({
    payments: z.array(InsertPaymentsSchema),
    selected_orders_total: z.string(),
    selected_orders_ids: z.array(z.number()),
    customer_id: z.number(),
  })

export type savePayment = z.infer<typeof savePaymentSchema>;
export type savePaymentKeys = keyof savePayment;
