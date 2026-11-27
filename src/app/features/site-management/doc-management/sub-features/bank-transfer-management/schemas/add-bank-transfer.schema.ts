import { transformDateFormat } from '@shared/utility/date-time.util';
import * as z from 'zod';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { BankTransferUpsertShapeSchema } from './base-bank-transfer.schema';
import {
  DirectPaymentSheetRefSchema,
  PaymentRecordModeField,
} from '@features/centralized-payment-management/payment-sheet-management/schemas/direct-payment-sheet.schema';

export const AddBankTransferRequestSchema =
  BankTransferUpsertShapeSchema.extend({
    // Vendor transfer only: picks the endpoint in the service; not part of the body.
    recordMode: PaymentRecordModeField.nullable(),
  }).transform(data => ({
    partyType: data.partyType,
    invoiceId: data.partyType === EDocContext.SALES ? data.invoiceNumber : null,
    bookPaymentId:
      data.partyType === EDocContext.PURCHASE ? data.bookPaymentNumber : null,
    paidFromAccountId: data.paidFromAccount ?? null,
    utrNumber: data.utrNumber,
    transferDate: transformDateFormat(data.transferDate),
    transferAmount: data.transferAmount,
    proofFileKey: data.transferProofFileKey,
    proofFileName: data.transferProofFileName,
    remarks: data.remarks,
  }));

export const AddBankTransferResponseSchema = z.looseObject({
  message: z.string(),
  /** PURCHASE only — the payment sheet auto-created for this transfer. */
  paymentSheet: DirectPaymentSheetRefSchema,
});
