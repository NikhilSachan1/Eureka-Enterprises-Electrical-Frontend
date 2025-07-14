import { z } from "zod";
import { GetRolePermissionRequestSchema, GetRolePermissionsResponseSchema } from "../dto/get-role-permissions.dto";
import { SetRolePermissionRequestSchema, SetRolePermissionResponseSchema } from "../dto/set-role-permission.dto";

export type IGetRolePermissionRequestDto = z.infer<typeof GetRolePermissionRequestSchema>;
export type IGetRolePermissionsResponseDto = z.infer<typeof GetRolePermissionsResponseSchema>;
export type ISetRolePermissionRequestDto = z.infer<typeof SetRolePermissionRequestSchema>;
export type ISetRolePermissionResponseDto = z.infer<typeof SetRolePermissionResponseSchema>;