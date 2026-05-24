import {
  dateField,
  isoDateTimeField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import { roundCurrencyAmount } from '@shared/utility/number.util';
import z from 'zod';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const BankTransferBaseSchema = z.looseObject({
  id: uuidField,
  createdAt: isoDateTimeField,
  siteId: uuidField,
  partyType: z.enum(EDocContext),
  invoiceId: uuidField.nullable(),
  bookPaymentId: uuidField.nullable(),
  utrNumber: z.string(),
  transferDate: onlyDateStringField,
  transferAmount: z.string(),
  tdsPercentage: z.coerce.number().nullable().optional(),
  tdsDeducted: z.string().nullable().optional(),
  proofFileKey: z.string().nullable(),
  proofFileName: z.string().nullable(),
  remarks: z.string().nullable(),
});

const bankTransferMoneyFieldSchema = z.coerce
  .number()
  .transform(val => roundCurrencyAmount(val));

const bankTransferOptionalMoneyFieldSchema = z.coerce
  .number()
  .optional()
  .transform(val => (val === undefined ? undefined : roundCurrencyAmount(val)));

export const BankTransferUpsertShapeSchema = z
  .object({
    partyType: z.enum(EDocContext),
    invoiceNumber: uuidField.nullable(),
    bookPaymentNumber: uuidField.nullable(),
    utrNumber: z.string(),
    transferDate: dateField,
    taxableAmount: bankTransferOptionalMoneyFieldSchema,
    tdsPercentage: z.coerce.number().optional(),
    tdsDeducted: bankTransferOptionalMoneyFieldSchema,
    transferAmount: bankTransferMoneyFieldSchema,
    transferProofFileKey: z.string().nullable(),
    transferProofFileName: z.string().nullable(),
    remarks: z.string().nullable(),
  })
  .strict();
