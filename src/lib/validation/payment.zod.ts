import { z } from 'zod';
import { PaymentMethodZod, currencyTypeZod } from './types.zod.typescript';

export const savePaymentSchema = z
  .object({
    payments_details: z.array(z.object({
      customer_id: z.number(),
      exchange_rate_id: z.number(),
      user_id: z.string(),
      currency: currencyTypeZod,
      default_currency_equivalent: z.string(),
      cash_paid: z.string(),
      payment_method: PaymentMethodZod
    })),
    selected_orders_total: z.string(),
    selected_orders_ids: z.array(z.number()),
    customer_id: z.number(),
    exchange_rate_id: z.number()
  })

export type SavePayment = z.infer<typeof savePaymentSchema>;
export type SavePaymentKeys = keyof SavePayment;
