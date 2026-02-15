import { z } from 'zod';
import { toLowerCase } from '@shared/utility';
import { RoleUpsertShapeSchema } from './base-role.schema';

export const RoleEditRequestSchema = RoleUpsertShapeSchema.pick({
  roleDescription: true,
})
  .strict()
  .transform(data => {
    return {
      description: toLowerCase(data.roleDescription),
    };
  });

export const RoleEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
