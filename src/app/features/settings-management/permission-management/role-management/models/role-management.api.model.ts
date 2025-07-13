import { z } from "zod";
import { GetRoleListResponseSchema, RoleListBaseResponseSchema } from "../dto/role-list-management.dto";
import { AddRoleManagementDto, AddRoleManagementResponseSchema } from "../dto/add-role-management.dto";
import { EditRoleManagementRequestSchema, EditRoleManagementResponseSchema } from "../dto/edit-role-management.dto";
import { DeleteRoleRequestSchema, DeleteRoleResponseSchema } from "../dto/delete-role-management.dto";

export type IGetRoleListResponseDto = z.infer<typeof GetRoleListResponseSchema>;
export type IGetSingleRoleListResponseDto = z.infer<typeof RoleListBaseResponseSchema>;
export type IAddRoleManagementRequestDto = z.infer<typeof AddRoleManagementDto>;
export type IAddRoleManagementResponseDto = z.infer<typeof AddRoleManagementResponseSchema>;
export type IEditRoleManagementRequestDto = z.infer<typeof EditRoleManagementRequestSchema>;
export type IEditRoleManagementResponseDto = z.infer<typeof EditRoleManagementResponseSchema>;
export type IDeleteRoleManagementRequestDto = z.infer<typeof DeleteRoleRequestSchema>;
export type IDeleteRoleManagementResponseDto = z.infer<typeof DeleteRoleResponseSchema>;