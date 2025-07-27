import { z } from 'zod';

export const SystemPermissionBaseSchema = z
  .object({
    name: z.string().trim().min(1),
    module: z.string().trim().min(1),
    label: z.string().trim().min(1),
    description: z.string().trim().min(1),
    isEditable: z.boolean(),
    isDeletable: z.boolean(),
  })
  .strict();
