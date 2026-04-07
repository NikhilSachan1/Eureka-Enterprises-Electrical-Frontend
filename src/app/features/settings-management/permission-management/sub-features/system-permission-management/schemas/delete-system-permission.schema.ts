import { z } from 'zod';
import { SystemPermissionBaseSchema } from './base-system-permission.schema';

const { id } = SystemPermissionBaseSchema.shape;

export const SystemPermissionDeleteRequestSchema = z
  .object({
    systemPermissionIds: z.array(id).min(1),
  })
  .strict()
  .transform(data => {
    return {
      ids: data.systemPermissionIds,
    };
  });

export const SystemPermissionDeleteResponseSchema = z.looseObject({
  failed: z.array(
    z.object({
      error: z.string(),
      id,
    })
  ),
  success: z.array(z.string()),
});
