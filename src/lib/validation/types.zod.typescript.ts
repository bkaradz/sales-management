import { z } from "zod"

export type ProductCategories = 'Embroidery' | 'Threads' | 'Needles' | 'Backing' | 'Prewound Bobbin' | 'Bobbin Case' | 'Golf Shirts' | 'Round Neck' | 'Work Suit' | 'Cap' | 'Other'
export type PaymentMethod = 'Cash USD' | 'Cash Rand' | 'Cash Pula' | 'Cash Bonds' | 'Ecocash' | 'Swipe' | 'Banc ABC' | 'Stewart Bank'
export type ProductionStatus = 'Origination'  | 'Received' | 'Embroidery' | 'Trimming' | 'Collected'
export type SalesStatus = 'Quotation' | 'Sales Order' | 'Invoice' | 'Receipt' | 'Cancelled'
export type PaymentStatus = 'Awaiting Payment' | 'Paid' | 'Cancelled' | 'Refunded' | 'Awaiting Sales Order'
export type GarmentPlacement = 'Front Left' | 'Front Right' | 'Upper Back' | 'Lower Back' | 'Right Sleeve' | 
    'Left Sleeve' | 'Cap Front' | 'Cap Back' | 'Cap Right Side' | 'Cap Left Side' | 'Name Tag' | 'Marked Position' | 
    'Trouser Front Left' | 'Trouser Front Right' | 'Trouser Back Left' | 'Trouser Back Right'
export type EmbroideryType = 'Flat' | 'Cap' | 'Applique' | 'Name Tag'

export const ProductCategoriesZod = z.enum([
  'Embroidery', 'Threads', 'Needles', 'Backing', 'Prewound Bobbin', 'Bobbin Case', 'Golf Shirts', 'Round Neck', 'Work Suit', 'Cap', 'Other'
], { required_error: 'Product Category is required' })
export const PaymentMethodZod = z.enum([
  'Cash USD', 'Cash Rand', 'Cash Pula', 'Cash Bonds', 'Ecocash', 'Swipe', 'Banc ABC', 'Stewart Bank'
], { required_error: 'Payment Method is required' })
export const ProductionStatusZod = z.enum([
  'Origination', 'Awaiting Logo Approval', 'Received', 'Awaiting Embroidery', 'Embroidery', 'Awaiting Trimming', 'Trimming', 'Awaiting Collection', 'Collected'
], { required_error: 'Production Status is required' })
export const SalesStatusZod = z.enum([
  'Quotation', 'Sales Order', 'Invoice', 'Receipt', 'Cancelled'
], { required_error: 'Sales Status is required' })
export const PaymentStatusZod = z.enum([
  'Awaiting Payment', 'Paid', 'Cancelled', 'Refunded', 'Awaiting Sales Order'
], { required_error: 'Payment Status is required' })
export const GarmentPlacementZod = z.enum([
  'Front Left', 'Front Right', 'Upper Back', 'Lower Back', 'Right Sleeve', 'Left Sleeve', 'Cap Front', 'Cap Back', 'Cap Right Side', 'Cap Left Side', 
  'Name Tag', 'Marked Position', 'Trouser Front Left', 'Trouser Front Right', 'Trouser Back Left', 'Trouser Back Right'
], { required_error: 'Garment Placement is required' })
export const EmbroideryTypeZod = z.enum([
  'Flat', 'Cap', 'Applique', 'Name Tag'
], { required_error: 'Embroidery Type is required' })

export const currencyZodObject = z.object({
  amount: z.number(),
  currency: z.object({
    code: z.string(),
    base: z.number(),
    exponent: z.number()
  }),
  scale: z.number()
})