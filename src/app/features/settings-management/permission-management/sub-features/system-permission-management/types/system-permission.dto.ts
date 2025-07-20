import { z } from 'zod';
import {
  SystemPermissionGetResponseSchema,
  SystemPermissionAddRequestSchema,
  SystemPermissionAddResponseSchema,
  SystemPermissionDeleteRequestSchema,
  SystemPermissionDeleteResponseSchema,
  SystemPermissionEditRequestSchema,
  SystemPermissionEditResponseSchema,
  SystemPermissionGetBaseResponseSchema,
} from '../schemas';

export type ISystemPermissionAddRequestDto = z.infer<
  typeof SystemPermissionAddRequestSchema
>;
export type ISystemPermissionAddResponseDto = z.infer<
  typeof SystemPermissionAddResponseSchema
>;
export type ISystemPermissionEditRequestDto = z.infer<
  typeof SystemPermissionEditRequestSchema
>;
export type ISystemPermissionEditResponseDto = z.infer<
  typeof SystemPermissionEditResponseSchema
>;
export type ISystemPermissionGetResponseDto = z.infer<
  typeof SystemPermissionGetResponseSchema
>;
export type ISystemPermissionGetBaseResponseDto = z.infer<
  typeof SystemPermissionGetBaseResponseSchema
>;
export type ISystemPermissionDeleteRequestDto = z.infer<
  typeof SystemPermissionDeleteRequestSchema
>;
export type ISystemPermissionDeleteResponseDto = z.infer<
  typeof SystemPermissionDeleteResponseSchema
>;
