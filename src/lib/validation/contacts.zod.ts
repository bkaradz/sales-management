import { z } from 'zod';

export const saveContactsSchema = z
  .object({
    fullName: z.string({ required_error: 'Full Name is required' }).min(3).trim(),
    email: z.array(z.string().email()).optional(),
    phone: z.array(z.string()).optional(),
    addresses: z.array(z.string()).optional(),
    isCorporate: z.boolean().optional(),
    vatOrBpNumber: z.string().optional()
  }).required({ fullName: true })

export type SaveContacts = z.infer<typeof saveContactsSchema>;
export type SaveContactsKeys = keyof SaveContacts;


export const saveContactsArraySchema = z.array(saveContactsSchema)

export type saveContactsArray = z.infer<typeof saveContactsArraySchema>;
export type saveContactsArrayKeys = keyof saveContactsArray;

export const updateContactsSchema = saveContactsSchema.extend({
  id: z.number()
})

export type UpdateContacts = z.infer<typeof updateContactsSchema>;
export type UpdateContactsKeys = keyof UpdateContacts;
