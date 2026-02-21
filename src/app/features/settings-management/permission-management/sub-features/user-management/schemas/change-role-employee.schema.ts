import { z } from 'zod';
import { uuidField } from '@shared/schemas';

export const UserChangeRoleRequestSchema = z
  .object({
    employeeRoles: z.array(uuidField).min(1),
  })
  .strict()
  .transform(data => ({
    roleIds: data.employeeRoles,
  }));

export const UserChangeRoleResponseSchema = z.object({
  message: z.string(),
});
