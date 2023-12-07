import { z } from "zod"
import { embroideryType, garmentPlacement, paymentMethod, paymentStatus, productCategories, productionStatus, salesStatus } from "../utility/lists.utility";


export const ProductCategoriesZod = z.enum(productCategories, { required_error: 'Product Category is required', invalid_type_error: 'Select front the list' })
export const PaymentMethodZod = z.enum(paymentMethod, { required_error: 'Payment Method is required' })
export const ProductionStatusZod = z.enum(productionStatus, { required_error: 'Production Status is required' })
export const SalesStatusZod = z.enum(salesStatus, { required_error: 'Sales Status is required' })
export const PaymentStatusZod = z.enum(paymentStatus, { required_error: 'Payment Status is required' })
export const GarmentPlacementZod = z.enum(garmentPlacement, { required_error: 'Garment Placement is required' })
export const EmbroideryTypeZod = z.enum(embroideryType, { required_error: 'Embroidery Type is required' })

