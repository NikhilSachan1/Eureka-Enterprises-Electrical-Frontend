import { z } from 'zod';
import { LoginRequestSchema, LoginResponseSchema } from '../schemas/auth.dto';

export type ILoginRequestDto = z.infer<typeof LoginRequestSchema>;
export type ILoginResponseDto = z.infer<typeof LoginResponseSchema>;
