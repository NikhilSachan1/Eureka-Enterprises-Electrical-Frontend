import { z } from 'zod';

export const AuditSchema = z.object({
  createdBy: z.string().trim().min(1).nullable(),
  updatedBy: z.string().trim().min(1).nullable(),
  deletedBy: z.string().trim().min(1).nullable(),
  createdAt: z.iso.datetime().trim().min(1),
  updatedAt: z.iso.datetime().trim().min(1).nullable(),
  deletedAt: z.iso.datetime().trim().min(1).nullable(),
});
