import { z } from 'zod';
import { AddSystemPermissionRequestSchema, AddSystemPermissionResponseSchema } from '../dto/system-permission-management.dto';

export type IAddSystemPermissionRequestDto = z.infer<typeof AddSystemPermissionRequestSchema>;
export type IAddSystemPermissionResponseDto = z.infer<typeof AddSystemPermissionResponseSchema>;