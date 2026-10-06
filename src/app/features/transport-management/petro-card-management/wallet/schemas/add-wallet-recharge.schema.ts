import { uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';
import { WalletRechargeUpsertShapeSchema } from './base-wallet-recharge.schema';

export const WalletRechargeAddRequestSchema =
  WalletRechargeUpsertShapeSchema.transform(data => ({
    amount: data.amount,
    rechargeDate: transformDateFormat(data.rechargeDate),
    remarks: data.remarks?.trim() || undefined,
  }));

export const WalletRechargeAddResponseSchema = z.looseObject({
  message: z.string(),
  id: uuidField,
  balance: z.coerce.number(),
});
