import { z } from 'zod';
import {
  RoleAddRequestSchema,
  RoleAddResponseSchema,
  RoleEditRequestSchema,
  RoleEditResponseSchema,
  RoleDeleteRequestSchema,
  RoleDeleteResponseSchema,
  RoleGetBaseResponseSchema,
  RoleGetResponseSchema,
} from '../schemas';

export type IRoleAddRequestDto = z.infer<typeof RoleAddRequestSchema>;
export type IRoleAddResponseDto = z.infer<typeof RoleAddResponseSchema>;
export type IRoleEditRequestDto = z.infer<typeof RoleEditRequestSchema>;
export type IRoleEditResponseDto = z.infer<typeof RoleEditResponseSchema>;
export type IRoleDeleteRequestDto = z.infer<typeof RoleDeleteRequestSchema>;
export type IRoleDeleteResponseDto = z.infer<typeof RoleDeleteResponseSchema>;
export type IRoleGetBaseResponseDto = z.infer<typeof RoleGetBaseResponseSchema>;
export type IRoleGetResponseDto = z.infer<typeof RoleGetResponseSchema>;
