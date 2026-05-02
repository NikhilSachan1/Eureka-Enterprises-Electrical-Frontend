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
    /** Purchase: optional; sales: at least one file (see superRefine). */
    transferAttachments: z.array(fileField).optional(),
    transferRemark: z.string().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.docContext === 'sales' &&
      (!data.transferAttachments || data.transferAttachments.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bank statement / proof is required',
        path: ['transferAttachments'],
      });
    }
  })
  .transform(data => ({
    documentNumber: data.utrNumber,
    docReferenceNumber: data.paymentAdviceRef,
    documentDate: transformDateFormat(data.transferDate),
    taxableAmount: null,
    gstAmount: null,
    tdsDeductionAmount: null,
    netAmount: data.transferTotalAmount,
    attachments:
      data.transferAttachments && data.transferAttachments.length > 0
        ? data.transferAttachments
        : null,
    note: data.transferRemark ?? null,
    documentType: EDocType.BANK_TRANSFER,
    docContext: data.docContext,
  }));

export const BankTransferDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
