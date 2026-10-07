import { uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';
import {
  WalletRechargeStatusSchema,
  WalletRechargeUpsertShapeSchema,
} from './base-wallet-recharge.schema';

export const WalletRechargeAddRequestSchema =
  WalletRechargeUpsertShapeSchema.transform(data => ({
    amount: data.amount,
    rechargeDate: transformDateFormat(data.rechargeDate),
  }));

export const WalletRechargeAddResponseSchema = z.looseObject({
  message: z.string(),
  id: uuidField,
  status: WalletRechargeStatusSchema.optional(),
  balance: z.coerce.number(),
  outstandingRecharge: z.coerce.number().optional(),
});
