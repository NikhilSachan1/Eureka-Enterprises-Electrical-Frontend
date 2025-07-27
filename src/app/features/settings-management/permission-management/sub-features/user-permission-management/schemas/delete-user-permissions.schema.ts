import { z } from 'zod';

export const UserPermissionsDeleteRequestSchema = z.object({
  userId: z.uuid(),
  permissionIds: z.array(z.uuid()),
});

export const UserPermissionsDeleteResponseSchema = z.object({
  message: z.string().nonempty(),
});
