import { z } from 'zod';
import {
  RolePermissionsGetRequestSchema,
  RolePermissionsGetResponseSchema,
  RolePermissionsSetRequestSchema,
  RolePermissionsSetResponseSchema,
  RolePermissionsBaseSchema,
} from '../schemas';

export type IRolePermissionsGetRequestDto = z.infer<
  typeof RolePermissionsGetRequestSchema
>;
export type IRolePermissionsGetResponseDto = z.infer<
  typeof RolePermissionsGetResponseSchema
>;

export type IRolePermissionsSetRequestDto = z.infer<
  typeof RolePermissionsSetRequestSchema
>;
export type IRolePermissionsSetResponseDto = z.infer<
  typeof RolePermissionsSetResponseSchema
>;
export type IRolePermissionsBaseDto = z.infer<typeof RolePermissionsBaseSchema>;
