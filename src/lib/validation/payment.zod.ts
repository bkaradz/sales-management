import { z } from 'zod';
import { PaymentMethodZod, currencyTypeZod } from './types.zod.typescript';

export const savePaymentSchema = z
  .object({
    payments_details: z.array(z.object({
      customerId: z.number(),
      exchangeRateId: z.number(),
      userId: z.string(),
      currency: currencyTypeZod,
      defaultCurrencyEquivalent: z.string(),
      cashPaid: z.string(),
      paymentMethod: PaymentMethodZod
    })),
    selected_orders_total: z.string(),
    selected_orders_ids: z.array(z.number()),
    customerId: z.number(),
    exchangeRateId: z.number()
  })

export type SavePayment = z.infer<typeof savePaymentSchema>;
export type SavePaymentKeys = keyof SavePayment;
