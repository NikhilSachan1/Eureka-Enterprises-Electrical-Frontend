import { z } from 'zod';
import { RoleBaseSchema } from './base-role.schema';

const { id } = RoleBaseSchema.shape;

export const RoleDeleteRequestSchema = z
  .object({
    roleIds: z.array(id).min(1),
  })
  .strict()
  .transform(data => {
    return {
      ids: data.roleIds,
    };
  });

export const RoleDeleteResponseSchema = z
  .object({
    failed: z.array(
      z.object({
        error: z.string(),
        id,
      })
    ),
    success: z.array(z.string()),
  })
  .strict();
