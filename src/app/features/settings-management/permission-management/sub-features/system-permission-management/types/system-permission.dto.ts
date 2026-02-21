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
  SystemPermissionGetRequestSchema,
} from '../schemas';

/**
 * system permission add request dto
 */
export type ISystemPermissionAddRequestDto = z.infer<
  typeof SystemPermissionAddRequestSchema
>;
export type ISystemPermissionAddResponseDto = z.infer<
  typeof SystemPermissionAddResponseSchema
>;
export type ISystemPermissionAddFormDto = z.input<
  typeof SystemPermissionAddRequestSchema
>;
/**
 * system permission edit request dto
 */
export type ISystemPermissionEditRequestDto = z.infer<
  typeof SystemPermissionEditRequestSchema
>;
export type ISystemPermissionEditResponseDto = z.infer<
  typeof SystemPermissionEditResponseSchema
>;
export type ISystemPermissionEditFormDto = ISystemPermissionAddFormDto;
/**
 * system permission delete request dto
 */
export type ISystemPermissionDeleteRequestDto = z.infer<
  typeof SystemPermissionDeleteRequestSchema
>;
export type ISystemPermissionDeleteFormDto = z.input<
  typeof SystemPermissionDeleteRequestSchema
>;
export type ISystemPermissionDeleteResponseDto = z.infer<
  typeof SystemPermissionDeleteResponseSchema
>;

/**
 * system permission get response dto
 */
export type ISystemPermissionGetResponseDto = z.infer<
  typeof SystemPermissionGetResponseSchema
>;
export type ISystemPermissionGetBaseResponseDto = z.infer<
  typeof SystemPermissionGetBaseResponseSchema
>;
export type ISystemPermissionGetRequestDto = z.infer<
  typeof SystemPermissionGetRequestSchema
>;
export type ISystemPermissionGetFormDto = z.input<
  typeof SystemPermissionGetRequestSchema
>;
