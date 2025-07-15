import { z } from "zod";
import { GetRoleListResponseSchema, RoleListBaseResponseSchema } from "@features/settings-management/permission-management/role-management/dto/role-list-management.dto";
import { AddRoleManagementRequestSchema, AddRoleManagementResponseSchema } from "@features/settings-management/permission-management/role-management/dto/add-role-management.dto";
import { EditRoleManagementRequestSchema, EditRoleManagementResponseSchema } from "@features/settings-management/permission-management/role-management/dto/edit-role-management.dto";
import { DeleteRoleRequestSchema, DeleteRoleResponseSchema } from "@features/settings-management/permission-management/role-management/dto/delete-role-management.dto";

export type IGetRoleListResponseDto = z.infer<typeof GetRoleListResponseSchema>;
export type IGetSingleRoleListResponseDto = z.infer<typeof RoleListBaseResponseSchema>;
export type IAddRoleManagementRequestDto = z.infer<typeof AddRoleManagementRequestSchema>;
export type IAddRoleManagementResponseDto = z.infer<typeof AddRoleManagementResponseSchema>;
export type IEditRoleManagementRequestDto = z.infer<typeof EditRoleManagementRequestSchema>;
export type IEditRoleManagementResponseDto = z.infer<typeof EditRoleManagementResponseSchema>;
export type IDeleteRoleManagementRequestDto = z.infer<typeof DeleteRoleRequestSchema>;
export type IDeleteRoleManagementResponseDto = z.infer<typeof DeleteRoleResponseSchema>;