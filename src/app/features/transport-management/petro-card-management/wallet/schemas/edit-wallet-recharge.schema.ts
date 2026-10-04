import { uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';
import { WalletRechargeUpsertShapeSchema } from './base-wallet-recharge.schema';

export const WalletRechargeEditRequestSchema =
  WalletRechargeUpsertShapeSchema.transform(data => ({
    amount: data.amount,
    rechargeDate: transformDateFormat(data.rechargeDate),
    referenceNumber: data.referenceNumber?.trim() || undefined,
    paymentMode: data.paymentMode?.trim() || undefined,
    paidFromAccountId: data.paidFromAccountId || undefined,
    remarks: data.remarks?.trim() || undefined,
  }));

export const WalletRechargeEditResponseSchema = z.looseObject({
  message: z.string(),
  id: uuidField,
  balance: z.coerce.number(),
});
