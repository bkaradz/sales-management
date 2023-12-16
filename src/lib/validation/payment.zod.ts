import { z } from 'zod';

export const savePaymentSchema = z
  .object({
    cash_paid: z.string(),
    selected_orders_total: z.string(),
    selected_orders_ids: z.array(z.number()),
    payment_method: z.string({ required_error: 'Payment Method is required' }),
    customer_id: z.number(),
  })

export type savePayment = z.infer<typeof savePaymentSchema>;
export type savePaymentKeys = keyof savePayment;
