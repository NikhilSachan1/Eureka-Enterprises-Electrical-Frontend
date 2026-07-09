import { transformDateFormat } from '@shared/utility/date-time.util';
import z from 'zod';
import { BankTransferUpsertShapeSchema } from './base-bank-transfer.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const EditBankTransferRequestSchema = BankTransferUpsertShapeSchema.omit(
  {
    invoiceNumber: true,
    bookPaymentNumber: true,
  }
).transform(data => ({
  paidFromAccountId: data.paidFromAccount ?? null,
  utrNumber: data.utrNumber,
  transferDate: transformDateFormat(data.transferDate),
  proofFileKey: data.transferProofFileKey,
  proofFileName: data.transferProofFileName,
  remarks: data.remarks,
  transferAmount:
    EDocContext.SALES === data.partyType ? data.transferAmount : null,
}));

export const EditBankTransferResponseSchema = z.looseObject({
  message: z.string(),
});
