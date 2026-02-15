import { z } from 'zod';
import {
  UserGetBaseResponseSchema,
  UserGetResponseSchema,
  UserPermissionDeleteRequestSchema,
  UserPermissionDeleteResponseSchema,
} from '../schemas';

/**
 * user get base response dto
 */
export type IUserGetBaseResponseDto = z.infer<typeof UserGetBaseResponseSchema>;
export type IUserGetResponseDto = z.infer<typeof UserGetResponseSchema>;

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
