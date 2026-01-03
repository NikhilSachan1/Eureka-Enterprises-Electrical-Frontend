import { z } from 'zod';
import {
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
} from '../schemas';

// Login types
export type ILoginRequestDto = z.infer<typeof LoginRequestSchema>;
export type ILoginResponseDto = z.infer<typeof LoginResponseSchema>;

// Refresh token types
export type IRefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>;
export type IRefreshTokenResponseDto = z.infer<
  typeof RefreshTokenResponseSchema
>;

// Logout types
export type ILogoutRequestDto = z.infer<typeof LogoutRequestSchema>;
export type ILogoutResponseDto = z.infer<typeof LogoutResponseSchema>;
