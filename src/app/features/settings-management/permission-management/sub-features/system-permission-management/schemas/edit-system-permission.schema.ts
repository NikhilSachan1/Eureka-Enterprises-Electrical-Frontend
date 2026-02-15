import { z } from 'zod';
import { toLowerCase } from '@shared/utility';
import { SystemPermissionUpsertShapeSchema } from './base-system-permission.schema';

export const SystemPermissionEditRequestSchema =
  SystemPermissionUpsertShapeSchema.pick({
    permissionDescription: true,
  })
    .strict()
    .transform(data => {
      return {
        description: toLowerCase(data.permissionDescription),
      };
    });

export const SystemPermissionEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
