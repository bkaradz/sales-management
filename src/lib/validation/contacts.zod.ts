import { z } from 'zod';

export const saveContactsSchema = z
  .object({
    full_name: z.string({ required_error: 'Full Name is required' }).min(3).trim(),
    email: z.array(z.string().email()).optional(),
    phone: z.array(z.string()).optional(),
    address: z.array(z.string()).optional(),
    is_corporate: z.enum(['on']).optional(),
    vat_or_bp_number: z.string().optional()
  }).required({ full_name: true })

export type SaveContacts = z.infer<typeof saveContactsSchema>;
export type SaveContactsKeys = keyof SaveContacts;
