import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const RoleBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  label: z.string().trim().min(1),
  isEditable: z.boolean(),
  isDeletable: z.boolean(),
  permissionCount: z.number(),
});

const { name, description } = RoleBaseSchema.shape;

export const RoleUpsertShapeSchema = z
  .object({
    roleName: name,
    roleDescription: description,
  })
  .loose();
