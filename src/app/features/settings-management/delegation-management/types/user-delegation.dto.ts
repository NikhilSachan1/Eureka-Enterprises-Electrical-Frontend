import { z } from 'zod';
import {
  UserDelegationAddRequestSchema,
  UserDelegationAddResponseSchema,
  UserDelegationGetBaseResponseSchema,
  UserDelegationGetRequestSchema,
  UserDelegationGetResponseSchema,
  UserDelegationWithdrawResponseSchema,
} from '../schemas';

export type IUserDelegationGetRequestDto = z.infer<
  typeof UserDelegationGetRequestSchema
>;
export type IUserDelegationGetFormDto = z.input<
  typeof UserDelegationGetRequestSchema
>;
export type IUserDelegationGetResponseDto = z.infer<
  typeof UserDelegationGetResponseSchema
>;
export type IUserDelegationGetBaseResponseDto = z.infer<
  typeof UserDelegationGetBaseResponseSchema
>;

export type IUserDelegationAddRequestDto = z.infer<
  typeof UserDelegationAddRequestSchema
>;
export type IUserDelegationAddFormDto = z.input<
  typeof UserDelegationAddRequestSchema
>;
export type IUserDelegationAddResponseDto = z.infer<
  typeof UserDelegationAddResponseSchema
>;

export type IUserDelegationWithdrawResponseDto = z.infer<
  typeof UserDelegationWithdrawResponseSchema
>;
