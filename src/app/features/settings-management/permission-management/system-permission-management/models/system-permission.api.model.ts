import { z } from 'zod';
import { AddSystemPermissionRequestSchema, AddSystemPermissionResponseSchema } from '../dto/add-system-permission-management.dto';
import { GetSystemPermissionListResponseSchema, SystemPermissionListBaseResponseSchema } from '../dto/system-permission-management-list.dto';
import { EditSystemPermissionRequestSchema, EditSystemPermissionResponseSchema } from '../dto/edit-system-permission-management.dto';
import { DeleteSystemPermissionRequestSchema, DeleteSystemPermissionResponseSchema } from '../dto/delete-system-permisson-management.dto';

export type IAddSystemPermissionRequestDto = z.infer<typeof AddSystemPermissionRequestSchema>;
export type IAddSystemPermissionResponseDto = z.infer<typeof AddSystemPermissionResponseSchema>;
export type IEditSystemPermissionRequestDto = z.infer<typeof EditSystemPermissionRequestSchema>;
export type IEditSystemPermissionResponseDto = z.infer<typeof EditSystemPermissionResponseSchema>;
export type IGetSystemPermissionListResponseDto = z.infer<typeof GetSystemPermissionListResponseSchema>;
export type IGetSingleSystemPermissionListResponseDto = z.infer<typeof SystemPermissionListBaseResponseSchema>;
export type IDeleteSystemPermissionRequestDto = z.infer<typeof DeleteSystemPermissionRequestSchema>;
export type IDeleteSystemPermissionResponseDto = z.infer<typeof DeleteSystemPermissionResponseSchema>;