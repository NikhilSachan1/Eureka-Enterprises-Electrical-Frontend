import { z } from 'zod';
import {
  AddInvoiceRequestSchema,
  AddInvoiceResponseSchema,
  EditInvoiceRequestSchema,
  EditInvoiceResponseSchema,
  ApproveInvoiceRequestSchema,
  ApproveInvoiceResponseSchema,
  DeleteInvoiceResponseSchema,
  InvoiceDetailGetResponseSchema,
  InvoiceGetBaseResponseSchema,
  InvoiceGetRequestSchema,
  InvoiceGetResponseSchema,
  RejectInvoiceRequestSchema,
  RejectInvoiceResponseSchema,
  UnlockGrantInvoiceResponseSchema,
  UnlockRejectInvoiceResponseSchema,
  UnlockRequestInvoiceRequestSchema,
  UnlockRequestInvoiceResponseSchema,
} from '../schemas';
import { InvoiceDetailGetRequestSchema } from '../schemas/get-invoice-detail.schema';

/*
  Invoice Get
*/

export type IInvoiceGetBaseResponseDto = z.infer<
  typeof InvoiceGetBaseResponseSchema
>;
export type IInvoiceGetResponseDto = z.infer<typeof InvoiceGetResponseSchema>;
export type IInvoiceGetRequestDto = z.infer<typeof InvoiceGetRequestSchema>;
export type IInvoiceGetFormDto = z.input<typeof InvoiceGetRequestSchema>;

/*
  Invoice Detail Get
*/
export type IInvoiceDetailGetResponseDto = z.infer<
  typeof InvoiceDetailGetResponseSchema
>;
export type IInvoiceDetailGetRequestDto = z.infer<
  typeof InvoiceDetailGetRequestSchema
>;

/*
  Invoice Approve
*/
export type IApproveInvoiceRequestDto = z.infer<
  typeof ApproveInvoiceRequestSchema
>;
export type IApproveInvoiceFormDto = z.input<
  typeof ApproveInvoiceRequestSchema
>;
export type IApproveInvoiceResponseDto = z.infer<
  typeof ApproveInvoiceResponseSchema
>;

/*
  Invoice Reject
*/
export type IRejectInvoiceRequestDto = z.infer<
  typeof RejectInvoiceRequestSchema
>;
export type IRejectInvoiceFormDto = z.input<typeof RejectInvoiceRequestSchema>;
export type IRejectInvoiceResponseDto = z.infer<
  typeof RejectInvoiceResponseSchema
>;

/*
  Invoice Unlock Request
*/
export type IUnlockRequestInvoiceRequestDto = z.infer<
  typeof UnlockRequestInvoiceRequestSchema
>;
export type IUnlockRequestInvoiceFormDto = z.input<
  typeof UnlockRequestInvoiceRequestSchema
>;
export type IUnlockRequestInvoiceResponseDto = z.infer<
  typeof UnlockRequestInvoiceResponseSchema
>;

/*
  Invoice Unlock Grant
*/
export type IUnlockGrantInvoiceResponseDto = z.infer<
  typeof UnlockGrantInvoiceResponseSchema
>;

/*
  Invoice Delete
*/
export type IDeleteInvoiceResponseDto = z.infer<
  typeof DeleteInvoiceResponseSchema
>;

/**
 * Invoice Unlock Reject
 */
export type IUnlockRejectInvoiceResponseDto = z.infer<
  typeof UnlockRejectInvoiceResponseSchema
>;

/**
 * Invoice Add
 */
export type IAddInvoiceRequestDto = z.infer<typeof AddInvoiceRequestSchema>;
export type IAddInvoiceFormDto = z.input<typeof AddInvoiceRequestSchema>;
export type IAddInvoiceUIFormDto = Omit<
  IAddInvoiceFormDto,
  'invoiceFileKey' | 'invoiceFileName'
> & {
  invoiceAttachment: File[];
  projectName: string;
};
export type IAddInvoiceResponseDto = z.infer<typeof AddInvoiceResponseSchema>;

/**
 * Invoice Edit
 */
export type IEditInvoiceRequestDto = z.infer<typeof EditInvoiceRequestSchema>;
export type IEditInvoiceFormDto = z.input<typeof EditInvoiceRequestSchema>;
export type IEditInvoiceUIFormDto = Omit<
  IEditInvoiceFormDto,
  'invoiceFileKey' | 'invoiceFileName'
> & {
  invoiceAttachment: File[];
  projectName: string;
  jmcNumber: string;
};
export type IEditInvoiceResponseDto = z.infer<typeof EditInvoiceResponseSchema>;
