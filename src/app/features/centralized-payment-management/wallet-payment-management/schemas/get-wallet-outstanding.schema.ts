import { FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';

const { pageSize, page } = FilterSchema.shape;

export const WalletOutstandingGetRequestSchema = z
  .object({
    pageSize,
    page,
  })
  .strict();

export const WalletOutstandingGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  amount: z.coerce.number(),
  rechargeDate: z.string(),
  remarks: z.string().nullable().optional(),
  raisedBy: z.string(),
  createdAt: z.string().optional(),
});

export const WalletOutstandingGetResponseSchema = z.looseObject({
  records: z.array(WalletOutstandingGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
  totalOutstanding: z.coerce.number(),
});
