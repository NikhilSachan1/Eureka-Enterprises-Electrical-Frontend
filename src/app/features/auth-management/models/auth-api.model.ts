import { z } from 'zod';
import { LoginRequestSchema, LoginResponseSchema } from "../dto/auth.dto";

export type ILoginRequestDto = z.infer<typeof LoginRequestSchema>;
export type ILoginResponseDto = z.infer<typeof LoginResponseSchema>;