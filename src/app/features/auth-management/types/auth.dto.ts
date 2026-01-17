import { z } from 'zod';
import {
  ForgetPasswordRequestSchema,
  ForgetPasswordResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  SwitchActiveRoleRequestSchema,
  SwitchActiveRoleResponseSchema,
} from '../schemas';

// Login types
export type ILoginRequestDto = z.infer<typeof LoginRequestSchema>;
export type ILoginFormDto = z.input<typeof LoginRequestSchema>;
export type ILoginResponseDto = z.infer<typeof LoginResponseSchema>;

// Refresh token types
export type IRefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>;
export type IRefreshTokenFormDto = z.input<typeof RefreshTokenRequestSchema>;
export type IRefreshTokenResponseDto = z.infer<
  typeof RefreshTokenResponseSchema
>;

// Logout types
export type ILogoutRequestDto = z.infer<typeof LogoutRequestSchema>;
export type ILogoutFormDto = z.input<typeof LogoutRequestSchema>;
export type ILogoutResponseDto = z.infer<typeof LogoutResponseSchema>;

// Switch active role types
export type ISwitchActiveRoleRequestDto = z.infer<
  typeof SwitchActiveRoleRequestSchema
>;
export type ISwitchActiveRoleFormDto = z.input<
  typeof SwitchActiveRoleRequestSchema
>;
export type ISwitchActiveRoleResponseDto = z.infer<
  typeof SwitchActiveRoleResponseSchema
>;

// Forget password types
export type IForgetPasswordRequestDto = z.infer<
  typeof ForgetPasswordRequestSchema
>;
export type IForgetPasswordFormDto = z.input<
  typeof ForgetPasswordRequestSchema
>;
export type IForgetPasswordResponseDto = z.infer<
  typeof ForgetPasswordResponseSchema
>;

// Reset password types
export type IResetPasswordRequestDto = z.infer<
  typeof ResetPasswordRequestSchema
>;
export type IResetPasswordFormDto = z.input<typeof ResetPasswordRequestSchema>;
export type IResetPasswordResponseDto = z.infer<
  typeof ResetPasswordResponseSchema
>;
