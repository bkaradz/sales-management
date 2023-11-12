import type { EmbroideryType, GarmentPlacement, PaymentMethod, ProductCategories, ProductionStatus, SalesStatus } from "$lib/validation/types.zod.typescript";


export const productCategories: ProductCategories[] = [
  'Embroidery',
  'Threads',
  'Needles',
  'Backing',
  'Prewound Bobbin',
  'Bobbin Case',
  'Golf Shirts',
  'Round Neck',
  'Work Suit',
  'Cap',
  'Other'
];

export const garmentPlacement: GarmentPlacement[] = [
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
];

export const embroideryType: EmbroideryType[] = ['Flat', 'Cap', 'Applique', 'Name Tag'];

export const salesStatus: SalesStatus[] = ['Quotation', 'Sales Order', 'Invoice', 'Receipt'];

export const paymentMethod: PaymentMethod[] = [
  'Cash USD',
  'Cash Rand',
  'Cash Pula',
  'Cash Bonds',
  'Ecocash',
  'Swipe',
  'Banc ABC',
  'Stewart Bank'
];

export const productionStatus: ProductionStatus[] = [
  'Origination', 'Received', 'Embroidery', 'Trimming', 'Collected'
];
