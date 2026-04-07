import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const SystemPermissionBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string().trim().min(1),
  module: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  isEditable: z.boolean(),
  isDeletable: z.boolean(),
});

const { module, description } = SystemPermissionBaseSchema.shape;

export const SystemPermissionUpsertShapeSchema = z.object({
  moduleName: module,
  moduleAction: z.string().trim().min(1),
  permissionDescription: description,
});
