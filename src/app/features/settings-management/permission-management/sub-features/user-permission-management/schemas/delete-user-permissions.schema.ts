import { z } from 'zod';

export const UserPermissionsDeleteRequestSchema = z.object({
  userId: z.string().uuid(),
  permissionIds: z.array(z.string().uuid()),
});

export const UserPermissionsDeleteResponseSchema = z.object({
  message: z.string().nonempty(),
});
