export const productCategories = [
  'Embroidery',
  'Threads',
  'Needles',
  'Backing',
  'Prewound Bobbin',
  'Trimmers',
  'Bobbin Case',
  'Golf Shirts',
  'Round Neck',
  'Work Suit',
  'Cap',
  'Other'
] as const;

export type ProductCategoriesUnion = typeof productCategories[number];

export const garmentPlacement = [
  'Front Left',
  'Front Right',
  'Upper Back',
  'Lower Back',
  'Right Sleeve',
  'Left Sleeve',
  'Cap Front',
  'Cap Back',
  'Cap Right Side',
  'Cap Left Side',
  'Trouser Front Left',
  'Trouser Front Right',
  'Trouser Back Left',
  'Trouser Back Right',
  'Name Tag',
  'Marked Position'
] as const;

export type GarmentPlacementUnion = typeof garmentPlacement[number];

export const embroideryType = ['Flat', 'Cap', 'Applique', 'Name Tag'] as const;

export type EmbroideryTypeUnion = typeof embroideryType[number];

export const currencyType = ['USD', 'ZAR', 'BWP', 'ZWB', 'ZWR'] as const;

export type currencyTypeUnion = typeof currencyType[number];

export const salesStatus = ['Quotation', 'Sales Order', 'Invoice', 'Receipt', 'Cancelled'] as const;

export type SalesStatusUnion = typeof salesStatus[number];

export const paymentMethod = [
  'Cash',
  'Ecocash',
  'Swipe',
  'Banc ABC',
  'Stewart Bank'
] as const;

export type PaymentMethodUnion = typeof paymentMethod[number]


export const paymentStatus = [
  'Awaiting Payment', 'Paid', 'Cancelled', 'Refunded', 'Awaiting Sales Order'
] as const;

export type PaymentStatusUnion = typeof paymentStatus[number]

export const productionStatus = [
  'Origination', 'Received', 'Embroidery', 'Trimming', 'Done', 'Collected'
] as const;

export type ProductionStatusUnion = typeof productionStatus[number]
