import { SystemPermissionUpsertShapeSchema } from './base-system-permission.schema';
import { replaceTextWithSeparator, toLowerCase } from '@shared/utility';
import { z } from 'zod';

export const SystemPermissionAddRequestSchema =
  SystemPermissionUpsertShapeSchema.strict().transform(data => {
    const moduleAction = toLowerCase(data.moduleAction);
    const moduleName = toLowerCase(data.moduleName);
    return {
      module: moduleName,
      name: `${moduleAction}_${moduleName}`,
      label: `${replaceTextWithSeparator(moduleAction, '_', ' ')} ${moduleName}`,
      description: toLowerCase(data.permissionDescription),
      isDeletable: true,
      isEditable: true,
    };
  });

export const SystemPermissionAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
