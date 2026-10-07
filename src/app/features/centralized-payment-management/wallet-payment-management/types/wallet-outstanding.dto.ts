import { z } from 'zod';
import {
  WalletOutstandingGetBaseResponseSchema,
  WalletOutstandingGetRequestSchema,
  WalletOutstandingGetResponseSchema,
} from '../schemas';

export type IWalletOutstandingGetBaseResponseDto = z.infer<
  typeof WalletOutstandingGetBaseResponseSchema
>;
export type IWalletOutstandingGetResponseDto = z.infer<
  typeof WalletOutstandingGetResponseSchema
>;
export type IWalletOutstandingGetFormDto = z.input<
  typeof WalletOutstandingGetRequestSchema
>;
