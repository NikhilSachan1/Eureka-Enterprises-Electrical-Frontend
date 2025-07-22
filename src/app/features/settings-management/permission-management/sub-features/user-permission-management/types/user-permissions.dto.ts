import { z } from 'zod';
import {
  UserPermissionsDeleteRequestSchema,
  UserPermissionsDeleteResponseSchema,
  UserPermissionsGetRequestSchema,
  UserPermissionsGetResponseSchema,
  UserPermissionsSetRequestSchema,
  UserPermissionsSetResponseSchema,
} from '../schemas';

export type IUserPermissionsGetRequestDto = z.infer<
  typeof UserPermissionsGetRequestSchema
>;

export type IUserPermissionsGetResponseDto = z.infer<
  typeof UserPermissionsGetResponseSchema
>;

export type IUserPermissionsSetRequestDto = z.infer<
  typeof UserPermissionsSetRequestSchema
>;

export type IUserPermissionsSetResponseDto = z.infer<
  typeof UserPermissionsSetResponseSchema
>;

export type IUserPermissionsDeleteRequestDto = z.infer<
  typeof UserPermissionsDeleteRequestSchema
>;

export type IUserPermissionsDeleteResponseDto = z.infer<
  typeof UserPermissionsDeleteResponseSchema
>;
