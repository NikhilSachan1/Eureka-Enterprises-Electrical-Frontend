import { z } from 'zod';

export const SiteHealthGetResponseSchema = z
  .object({
    healthScore: z.number().min(0).max(100).default(0),
    healthGrade: z.string().optional(),
  })
  .passthrough();
