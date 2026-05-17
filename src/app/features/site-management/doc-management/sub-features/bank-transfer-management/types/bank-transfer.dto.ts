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
  'partyType' | 'transferProofFileKey' | 'transferProofFileName'
> & {
  projectName: string;
  proofAttachment: File[];
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
> & {
  projectName: string;
  invoiceNumber: string | null;
  bookPaymentNumber: string | null;
  transferAmount: number | null;
  proofAttachment: File[];
};

export type IEditBankTransferResponseDto = z.infer<
  typeof EditBankTransferResponseSchema
>;

export type IDeleteBankTransferResponseDto = z.infer<
  typeof DeleteBankTransferResponseSchema
>;
