import { z } from 'zod';
import { currencyZodObject } from './product.zod';



export const saveOrderSchema = z
  .object({
    customer_id: z.number(),
    pricelist_id: z.number(),
    exchange_rates_id: z.number(),
    sales_status: z.number(),
    amount_tendered: currencyZodObject.required(),
    selected_orders_total: currencyZodObject.required(),
    selected_orders_ids: z.array(z.number()),
    payment_method: z.string({ required_error: 'Payment Method is required' }),
  })

export type saveOrder = z.infer<typeof saveOrderSchema>;
export type saveOrderKeys = keyof saveOrder;


export const saveCartSchema = z
  .object({
    amount_tendered: currencyZodObject.required(),
    selected_orders_total: currencyZodObject.required(),
    selected_orders_ids: z.array(z.number()),
    payment_method: z.string({ required_error: 'Payment Method is required' }),
    customer_id: z.number(),
  })

export type saveCart = z.infer<typeof saveCartSchema>;
export type saveCartKeys = keyof saveCart;
