import { z } from 'zod';
import {
  AddBankTransferRequestSchema,
  AddBankTransferResponseSchema,
  BankTransferDetailGetRequestSchema,
  BankTransferDetailGetResponseSchema,
  BankTransferGetBaseResponseSchema,
  BankTransferGetRequestSchema,
  BankTransferGetResponseSchema,
  DeleteBankTransferResponseSchema,
  EditBankTransferRequestSchema,
  EditBankTransferResponseSchema,
  SendEmailBankTransferRequestSchema,
  SendEmailBankTransferResponseSchema,
} from '../schemas';

export type IBankTransferGetBaseResponseDto = z.infer<
  typeof BankTransferGetBaseResponseSchema
>;
export type IBankTransferGetResponseDto = z.infer<
  typeof BankTransferGetResponseSchema
>;
export type IBankTransferGetFormDto = z.input<
  typeof BankTransferGetRequestSchema
>;

export type IBankTransferDetailGetResponseDto = z.infer<
  typeof BankTransferDetailGetResponseSchema
>;
export type IBankTransferDetailGetRequestDto = z.infer<
  typeof BankTransferDetailGetRequestSchema
>;

export type IAddBankTransferFormDto = z.input<
  typeof AddBankTransferRequestSchema
>;

export type IAddBankTransferUIFormDto = Omit<
  IAddBankTransferFormDto,
  | 'partyType'
  | 'transferProofFileKey'
  | 'transferProofFileName'
  | 'tdsPercentage'
  | 'tdsDeducted'
> & {
  projectName: string;
  proofAttachment: File[];
  tdsPercentage: number | null;
  tdsDeducted: number | null;
};

export type IAddBankTransferResponseDto = z.infer<
  typeof AddBankTransferResponseSchema
>;

export type IEditBankTransferFormDto = z.input<
  typeof EditBankTransferRequestSchema
>;
export type IEditBankTransferUIFormDto = Omit<
  IEditBankTransferFormDto,
  | 'transferProofFileKey'
  | 'transferProofFileName'
  | 'transferAmount'
  | 'partyType'
  | 'tdsPercentage'
  | 'tdsDeducted'
> & {
  projectName: string;
  invoiceNumber: string | null;
  bookPaymentNumber: string | null;
  transferAmount: number | null;
  tdsPercentage: number | null;
  tdsDeducted: number | null;
  proofAttachment: File[];
};

export type IEditBankTransferResponseDto = z.infer<
  typeof EditBankTransferResponseSchema
>;

export type IDeleteBankTransferResponseDto = z.infer<
  typeof DeleteBankTransferResponseSchema
>;

export type ISendEmailBankTransferFormDto = z.input<
  typeof SendEmailBankTransferRequestSchema
>;
export type ISendEmailBankTransferUIFormDto = Omit<
  ISendEmailBankTransferFormDto,
  'attachmentKeys'
>;
export type ISendEmailBankTransferResponseDto = z.infer<
  typeof SendEmailBankTransferResponseSchema
>;

/** Minimal record shape needed by the send-email dialog (from bank transfer list row). */
export interface ISendEmailPaymentAdviceRecordDto {
  id: string;
  referenceNumber: string;
  pdfKey: string | null;
  vendor: { email?: string | null };
}
