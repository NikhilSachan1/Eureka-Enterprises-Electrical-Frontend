import { uuidField } from '@shared/schemas';
import z from 'zod';

export const RolePermissionsBaseSchema = z.looseObject({
  id: uuidField,
  roleId: uuidField,
  permissionId: uuidField,
  isActive: z.boolean(),
});
