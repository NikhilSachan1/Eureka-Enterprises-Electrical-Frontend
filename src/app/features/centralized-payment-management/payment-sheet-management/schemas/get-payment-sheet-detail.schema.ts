import { isoDateTimeField, uuidField } from '@shared/schemas';
import { UserSchema } from '@shared/schemas/user.schema';
import z from 'zod';
import { EPaymentSheetSourceType } from '../types/payment-sheet.enum';

export const PaymentSheetDetailGetRequestSchema = z
  .object({
    paymentSheetId: uuidField,
  })
  .strict()
  .transform(data => ({
    id: data.paymentSheetId,
  }));

const PaymentSheetBankSnapshotSchema = z
  .looseObject({
    accountHolderName: z.string().nullable(),
    bankName: z.string().nullable(),
    accountNumber: z.string().nullable(),
    ifscCode: z.string().nullable(),
  })
  .nullable();

const PaymentSheetVendorSnapshotSchema = z
  .looseObject({
    name: z.string(),
  })
  .nullable();

export const PaymentSheetItemDetailSchema = z.looseObject({
  id: uuidField,
  beneficiaryType: z.string(),
  userId: uuidField.nullable(),
  vendorId: uuidField.nullable(),
  sourceType: z.enum(EPaymentSheetSourceType),
  pendingSnapshot: z.coerce.number(),
  currentAmount: z.coerce.number(),
  bankSnapshot: PaymentSheetBankSnapshotSchema,
  itemStatus: z.string(),
  paidAt: isoDateTimeField.nullable(),
  paymentRef: z.string().nullable(),
  user: UserSchema.nullable(),
  vendor: PaymentSheetVendorSnapshotSchema,
});

export const PaymentSheetDetailGetResponseSchema = z.looseObject({
  items: z.array(PaymentSheetItemDetailSchema),
});
