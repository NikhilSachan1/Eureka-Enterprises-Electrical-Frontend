import { z } from 'zod';
import {
  UserGetBaseResponseSchema,
  UserGetRequestSchema,
  UserGetResponseSchema,
} from '../schemas';

export type IUserGetBaseResponseDto = z.infer<typeof UserGetBaseResponseSchema>;
export type IUserGetResponseDto = z.infer<typeof UserGetResponseSchema>;
export type IUserGetRequestDto = z.infer<typeof UserGetRequestSchema>;
