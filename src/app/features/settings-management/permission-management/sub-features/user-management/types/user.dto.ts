import { z } from 'zod';
import {
  UserChangeRoleRequestSchema,
  UserChangeRoleResponseSchema,
  UserGetBaseResponseSchema,
  UserGetRequestSchema,
  UserGetResponseSchema,
  UserPermissionDeleteRequestSchema,
  UserPermissionDeleteResponseSchema,
} from '../schemas';

/**
 * user get base response dto
 */
export type IUserGetBaseResponseDto = z.infer<typeof UserGetBaseResponseSchema>;
export type IUserGetResponseDto = z.infer<typeof UserGetResponseSchema>;
export type IUserGetRequestDto = z.infer<typeof UserGetRequestSchema>;
export type IUserGetFormDto = z.input<typeof UserGetRequestSchema>;
/**
 * user permission delete request and response dto
 */
export type IUserPermissionDeleteRequestDto = z.infer<
  typeof UserPermissionDeleteRequestSchema
>;
export type IUserPermissionDeleteFormDto = z.input<
  typeof UserPermissionDeleteRequestSchema
>;
export type IUserPermissionDeleteResponseDto = z.infer<
  typeof UserPermissionDeleteResponseSchema
>;
/**
 * user change role request and response dto
 */
export type IUserChangeRoleRequestDto = z.infer<
  typeof UserChangeRoleRequestSchema
>;
export type IUserChangeRoleFormDto = z.input<
  typeof UserChangeRoleRequestSchema
>;
export type IUserChangeRoleResponseDto = z.infer<
  typeof UserChangeRoleResponseSchema
>;
