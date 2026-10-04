import { z } from 'zod';
import {
  WalletBalanceResponseSchema,
  WalletRechargeAddRequestSchema,
  WalletRechargeAddResponseSchema,
  WalletRechargeDeleteResponseSchema,
  WalletRechargeEditRequestSchema,
  WalletRechargeEditResponseSchema,
  WalletRechargeGetBaseResponseSchema,
  WalletRechargeGetRequestSchema,
  WalletRechargeGetResponseSchema,
} from '../schemas';

/*
 * Balance
 */
export type IWalletBalanceResponseDto = z.infer<
  typeof WalletBalanceResponseSchema
>;

/*
 * Get Recharges
 */
export type IWalletRechargeGetRequestDto = z.infer<
  typeof WalletRechargeGetRequestSchema
>;
export type IWalletRechargeGetFormDto = z.input<
  typeof WalletRechargeGetRequestSchema
>;
export type IWalletRechargeGetBaseResponseDto = z.infer<
  typeof WalletRechargeGetBaseResponseSchema
>;
export type IWalletRechargeGetResponseDto = z.infer<
  typeof WalletRechargeGetResponseSchema
>;

/*
 * Add Recharge
 */
export type IWalletRechargeAddRequestDto = z.infer<
  typeof WalletRechargeAddRequestSchema
>;
export type IWalletRechargeAddFormDto = z.input<
  typeof WalletRechargeAddRequestSchema
>;
export type IWalletRechargeAddUIFormDto = {
  [K in keyof IWalletRechargeAddFormDto]-?: IWalletRechargeAddFormDto[K];
};
export type IWalletRechargeAddResponseDto = z.infer<
  typeof WalletRechargeAddResponseSchema
>;

/*
 * Edit Recharge
 */
export type IWalletRechargeEditRequestDto = z.infer<
  typeof WalletRechargeEditRequestSchema
>;
export type IWalletRechargeEditFormDto = z.input<
  typeof WalletRechargeEditRequestSchema
>;
export type IWalletRechargeEditUIFormDto = IWalletRechargeAddUIFormDto;
export type IWalletRechargeEditResponseDto = z.infer<
  typeof WalletRechargeEditResponseSchema
>;

/*
 * Delete Recharge
 */
export type IWalletRechargeDeleteResponseDto = z.infer<
  typeof WalletRechargeDeleteResponseSchema
>;
