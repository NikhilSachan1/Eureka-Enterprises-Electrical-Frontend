import { transformDateFormat } from '@shared/utility/date-time.util';
import z from 'zod';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { BankTransferUpsertShapeSchema } from './base-bank-transfer.schema';

export const AddBankTransferRequestSchema =
  BankTransferUpsertShapeSchema.transform(data => ({
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
});
