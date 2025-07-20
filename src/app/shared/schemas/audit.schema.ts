import { z } from 'zod';

export const AuditSchema = z.object({
  createdBy: z
    .string({ required_error: 'Created by is required' })
    .trim()
    .min(1, 'Created by cannot be empty')
    .nullable(),
  updatedBy: z
    .string({ required_error: 'Updated by is required' })
    .trim()
    .min(1, 'Updated by cannot be empty')
    .nullable(),
  deletedBy: z
    .string({ required_error: 'Deleted by is required' })
    .trim()
    .min(1, 'Deleted by cannot be empty')
    .nullable(),
  createdAt: z
    .string({ required_error: 'Created at is required' })
    .trim()
    .min(1, 'Created at cannot be empty')
    .datetime({ message: 'Created at must be a valid ISO date string' }),
  updatedAt: z
    .string({ required_error: 'Updated at is required' })
    .trim()
    .min(1, 'Updated at cannot be empty')
    .datetime({ message: 'Updated at must be a valid ISO date string' })
    .nullable(),
  deletedAt: z
    .string({ required_error: 'Deleted at is required' })
    .trim()
    .min(1, 'Deleted at cannot be empty')
    .datetime({ message: 'Deleted at must be a valid ISO date string' })
    .nullable(),
});
