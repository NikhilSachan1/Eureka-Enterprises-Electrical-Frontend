import { SystemPermissionUpsertShapeSchema } from './base-system-permission.schema';
import { toLowerCase } from '@shared/utility';
import { z } from 'zod';

export const SystemPermissionAddRequestSchema =
  SystemPermissionUpsertShapeSchema.strict().transform(data => {
    return {
      module: toLowerCase(data.moduleName),
      name: toLowerCase(data.permissionName),
      label: toLowerCase(data.permissionLabel),
      description: toLowerCase(data.permissionDescription),
      platform: toLowerCase(data.platform),
      isDeletable: true,
      isEditable: true,
    };
  });

export const SystemPermissionAddResponseSchema = z.looseObject({
  message: z.string(),
});
