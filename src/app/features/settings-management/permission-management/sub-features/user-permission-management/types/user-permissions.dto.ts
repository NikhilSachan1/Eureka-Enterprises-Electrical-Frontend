import { z } from 'zod';
import {
  UserPermissionsDeleteRequestSchema,
  UserPermissionsDeleteResponseSchema,
  UserPermissionsGetRequestSchema,
  UserPermissionsGetResponseSchema,
  UserPermissionsSetRequestSchema,
  UserPermissionsSetResponseSchema,
} from '../schemas';

/**
 * user permissions get request dto
 */
export type IUserPermissionsGetRequestDto = z.infer<
  typeof UserPermissionsGetRequestSchema
>;
export type IUserPermissionsGetResponseDto = z.infer<
  typeof UserPermissionsGetResponseSchema
>;

/**
 * user permissions set request dto
 */
export type IUserPermissionsSetRequestDto = z.infer<
  typeof UserPermissionsSetRequestSchema
>;
export type IUserPermissionsSetFormDto = z.input<
  typeof UserPermissionsSetRequestSchema
>;
export type IUserPermissionsSetResponseDto = z.infer<
  typeof UserPermissionsSetResponseSchema
>;

/**
 * user permissions delete request dto
 */
export type IUserPermissionsDeleteRequestDto = z.infer<
  typeof UserPermissionsDeleteRequestSchema
>;

export type IUserPermissionsDeleteResponseDto = z.infer<
  typeof UserPermissionsDeleteResponseSchema
>;
