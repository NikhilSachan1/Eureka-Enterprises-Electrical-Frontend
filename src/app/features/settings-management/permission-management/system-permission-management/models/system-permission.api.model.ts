import { z } from 'zod';
import { AddSystemPermissionRequestSchema, AddSystemPermissionResponseSchema } from '../dto/add-system-permission-management.dto';
import { GetSystemPermissionListResponseSchema } from '../dto/system-permission-management-list.dto';

export type IAddSystemPermissionRequestDto = z.infer<typeof AddSystemPermissionRequestSchema>;
export type IAddSystemPermissionResponseDto = z.infer<typeof AddSystemPermissionResponseSchema>;
export type IGetSystemPermissionListResponseDto = z.infer<typeof GetSystemPermissionListResponseSchema>;