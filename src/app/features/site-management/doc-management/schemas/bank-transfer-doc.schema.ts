import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const BankTransferDocAddRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    paymentAdviceRef: z.string(),
    utrNumber: z.string(),
    transferDate: dateField,
    transferTotalAmount: z.number(),
    transferAttachments: z.array(fileField),
    transferRemark: z.string().optional(),
  })
  .strict()
  .transform(data => ({
    documentNumber: data.utrNumber,
    docReferenceNumber: data.paymentAdviceRef,
    documentDate: transformDateFormat(data.transferDate),
    taxableAmount: null,
    gstAmount: null,
    tdsDeductionAmount: null,
    netAmount: data.transferTotalAmount,
    attachments: data.transferAttachments,
    note: data.transferRemark ?? null,
    documentType: EDocType.BANK_TRANSFER,
    docContext: data.docContext,
  }));

export const BankTransferDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
