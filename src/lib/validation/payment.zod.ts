import { z } from 'zod';
import { currencyZodObject } from './product.zod';

export const savePaymentSchema = z
  .object({
    amount_tendered: currencyZodObject.required(),
    selected_orders_total: currencyZodObject.required(),
    selected_orders_ids: z.array(z.number()),
    payment_method: z.string({ required_error: 'Payment Method is required' }),
    customer_id: z.number(),
  })

export type savePayment = z.infer<typeof savePaymentSchema>;
export type savePaymentKeys = keyof savePayment;
