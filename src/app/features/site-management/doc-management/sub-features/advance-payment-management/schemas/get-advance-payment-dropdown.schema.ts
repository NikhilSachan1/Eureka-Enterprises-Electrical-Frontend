import { z } from 'zod';
import { uuidField } from '@shared/schemas';

export const AdvancePaymentDropdownGetRequestSchema = z
  .object({
    poId: uuidField.optional(),
    invoiceId: uuidField.optional(),
  })
  .strict();

const nullableAmountField = z.union([z.string(), z.number()]).nullable();

const AdvancePaymentDropdownMetaSchema = z.looseObject({
  advanceNumber: z.string().nullable().optional(),
  vendorAdvanceNumber: z.string().nullable().optional(),
  advanceDate: z.string().nullable().optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  settledAmount: nullableAmountField.optional(),
  balanceAmount: nullableAmountField.optional(),
  approvalStatus: z.string().optional(),
  poId: uuidField.nullable().optional(),
  poNumber: z.string().nullable().optional(),
  vendorName: z.string().nullable().optional(),
  maxSettleableAmount: z.union([z.string(), z.number()]).nullable().optional(),
});

export const AdvancePaymentDropdownRecordSchema = z.looseObject({
  id: uuidField,
  label: z.string(),
  eligible: z.boolean(),
  reason: z.string().nullable(),
  meta: AdvancePaymentDropdownMetaSchema,
});

export const AdvancePaymentDropdownGetResponseSchema = z.looseObject({
  records: z.array(AdvancePaymentDropdownRecordSchema),
});
