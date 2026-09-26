import { z } from 'zod';

export const interestSourceSchema = z.enum([
  'stickwijzer-resultaat',
  'productpagina',
  'algemeen',
]);
export type InterestSource = z.infer<typeof interestSourceSchema>;

export const interestFormSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).optional(),
    productSlug: z.string().optional(),
    message: z.string().max(1000).optional(),
    consentGiven: z.boolean(),
    source: interestSourceSchema,
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Geef minimaal een e-mailadres of telefoonnummer op.',
    path: ['email'],
  })
  .refine((data) => data.consentGiven === true, {
    message: 'Je moet akkoord gaan voordat we je kunnen benaderen.',
    path: ['consentGiven'],
  });

export type InterestFormInput = z.input<typeof interestFormSchema>;

export type InterestFormSubmission = z.infer<typeof interestFormSchema> & {
  submittedAt: string;
};
