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
        description: data.permissionDescription
          ? toLowerCase(data.permissionDescription)
          : null,
      };
    });

export const SystemPermissionEditResponseSchema = z.looseObject({
  message: z.string(),
});
