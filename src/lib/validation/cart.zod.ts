import { z } from 'zod';
import { EmbroideryTypeZod, GarmentPlacementZod, currencyZodObject } from './types.zod.typescript';

export const saveOrderSchema = z
  .object({
    customer_id: z.number(),
    pricelist_id: z.number(),
    exchange_rates_id: z.number(),
    sales_status: z.number(),
    description: z.string().optional(),
    delivery_date: z.string().datetime(),
    sales_amount: currencyZodObject.required(),
    total_products: z.number(),
  })

export type SaveOrder = z.infer<typeof saveOrderSchema>;
export type SaveOrderKeys = keyof SaveOrder;

export const saveOrderDetailsSchema = z
  .object({
    total_price: currencyZodObject.required(),
    unit_price: currencyZodObject.required(),
    quantity: z.number(),
    product_id: z.number(),

    embroidery_type: EmbroideryTypeZod.optional(),
    garment_placement: GarmentPlacementZod.optional(),
    stitches: z.number().optional(),
    pricelist_id: z.number().optional(),
  })

export type SaveOrderDetails = z.infer<typeof saveOrderDetailsSchema>;
export type SaveOrderDetailsKeys = keyof SaveOrderDetails;


export const saveCartOrderSchema = z
  .object({ order: z.any(), orders_details: z.array(saveOrderDetailsSchema) })

export type SaveCartOrder = z.infer<typeof saveCartOrderSchema>;
export type SaveCartOrderKeys = keyof SaveCartOrder;
