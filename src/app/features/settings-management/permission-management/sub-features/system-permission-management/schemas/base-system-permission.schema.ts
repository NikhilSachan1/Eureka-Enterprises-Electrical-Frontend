import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const SystemPermissionBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string().trim().min(1),
  module: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1).nullable(),
  platform: z.enum(['web', 'mobile']),
  isEditable: z.boolean(),
  isDeletable: z.boolean(),
});

const { module, name, label, description } = SystemPermissionBaseSchema.shape;

export const SystemPermissionUpsertShapeSchema = z.object({
  moduleName: module,
  permissionName: name,
  permissionLabel: label,
  permissionDescription: description,
  platform: z.enum(['web', 'mobile']),
});
