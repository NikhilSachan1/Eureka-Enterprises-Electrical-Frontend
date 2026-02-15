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

/**
 * role add request dto
 */
export type IRoleAddRequestDto = z.infer<typeof RoleAddRequestSchema>;
export type IRoleAddResponseDto = z.infer<typeof RoleAddResponseSchema>;
export type IRoleAddFormDto = z.input<typeof RoleAddRequestSchema>;
/**
 * role edit request dto
 */
export type IRoleEditRequestDto = z.infer<typeof RoleEditRequestSchema>;
export type IRoleEditResponseDto = z.infer<typeof RoleEditResponseSchema>;
export type IRoleEditFormDto = IRoleAddFormDto;
/**
 * role delete request dto
 */
export type IRoleDeleteRequestDto = z.infer<typeof RoleDeleteRequestSchema>;
export type IRoleDeleteResponseDto = z.infer<typeof RoleDeleteResponseSchema>;
export type IRoleDeleteFormDto = z.input<typeof RoleDeleteRequestSchema>;
/**
 * role get base response dto
 */
export type IRoleGetBaseResponseDto = z.infer<typeof RoleGetBaseResponseSchema>;
export type IRoleGetResponseDto = z.infer<typeof RoleGetResponseSchema>;
