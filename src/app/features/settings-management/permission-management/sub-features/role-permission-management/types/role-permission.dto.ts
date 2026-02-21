import { z } from 'zod';
import {
  RolePermissionsGetRequestSchema,
  RolePermissionsGetResponseSchema,
  RolePermissionsSetRequestSchema,
  RolePermissionsSetResponseSchema,
  RolePermissionsBaseSchema,
} from '../schemas';

/**
 * role permissions base dto
 */
export type IRolePermissionsBaseDto = z.infer<typeof RolePermissionsBaseSchema>;

/**
 * role permissions get request dto
 */
export type IRolePermissionsGetRequestDto = z.infer<
  typeof RolePermissionsGetRequestSchema
>;
export type IRolePermissionsGetFormDto = z.input<
  typeof RolePermissionsGetRequestSchema
>;
export type IRolePermissionsGetResponseDto = z.infer<
  typeof RolePermissionsGetResponseSchema
>;

/**
 * role permissions set request dto
 */
export type IRolePermissionsSetRequestDto = z.infer<
  typeof RolePermissionsSetRequestSchema
>;
export type IRolePermissionsSetFormDto = z.input<
  typeof RolePermissionsSetRequestSchema
>;
export type IRolePermissionsSetResponseDto = z.infer<
  typeof RolePermissionsSetResponseSchema
>;
