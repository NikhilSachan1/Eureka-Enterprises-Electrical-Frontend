import { z } from "zod";
import { RolePermissionsBaseResponseSchema } from "./get-role-permissions.dto";

export const SetRolePermissionRequestSchema = z.object({
    roleId: z
        .string()
        .uuid(),
    rolePermissions: z
        .array(z.object({
            permissionId: z.string().uuid(),
            isActive: z.boolean(),
        }))
}).strict();

export const SetRolePermissionResponseSchema = z.array(z.object(RolePermissionsBaseResponseSchema.shape));