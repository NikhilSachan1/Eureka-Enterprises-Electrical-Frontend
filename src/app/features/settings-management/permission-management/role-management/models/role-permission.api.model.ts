import { z } from "zod";
import { GetRolePermissionRequestSchema, GetRolePermissionsResponseSchema } from "@features/settings-management/permission-management/role-management/dto/get-role-permissions.dto";
import { SetRolePermissionRequestSchema, SetRolePermissionResponseSchema } from "@features/settings-management/permission-management/role-management/dto/set-role-permission.dto";

export type IGetRolePermissionRequestDto = z.infer<typeof GetRolePermissionRequestSchema>;
export type IGetRolePermissionsResponseDto = z.infer<typeof GetRolePermissionsResponseSchema>;
export type ISetRolePermissionRequestDto = z.infer<typeof SetRolePermissionRequestSchema>;
export type ISetRolePermissionResponseDto = z.infer<typeof SetRolePermissionResponseSchema>;