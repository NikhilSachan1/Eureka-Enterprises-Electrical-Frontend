import { z } from 'zod';
import { AddSystemPermissionRequestSchema, AddSystemPermissionResponseSchema } from '../dto/add-system-permission-management.dto';
import { GetSystemPermissionListResponseSchema, SystemPermissionListBaseResponseSchema } from '../dto/system-permission-management-list.dto';
import { EditSystemPermissionRequestSchema, EditSystemPermissionResponseSchema } from '../dto/edit-system-permission-management.dto';

export type IAddSystemPermissionRequestDto = z.infer<typeof AddSystemPermissionRequestSchema>;
export type IAddSystemPermissionResponseDto = z.infer<typeof AddSystemPermissionResponseSchema>;
export type IEditSystemPermissionRequestDto = z.infer<typeof EditSystemPermissionRequestSchema>;
export type IEditSystemPermissionResponseDto = z.infer<typeof EditSystemPermissionResponseSchema>;
export type IGetSystemPermissionListResponseDto = z.infer<typeof GetSystemPermissionListResponseSchema>;
export type IGetSingleSystemPermissionListResponseDto = z.infer<typeof SystemPermissionListBaseResponseSchema>;