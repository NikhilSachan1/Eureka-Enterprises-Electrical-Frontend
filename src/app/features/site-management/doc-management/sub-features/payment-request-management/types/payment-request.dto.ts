import { z } from 'zod';
import {
  AddPaymentRequestRequestSchema,
  AddPaymentRequestResponseSchema,
  ApprovePaymentRequestRequestSchema,
  ApprovePaymentRequestResponseSchema,
  DeletePaymentRequestResponseSchema,
  EditPaymentRequestRequestSchema,
  EditPaymentRequestResponseSchema,
  PaymentRequestDetailGetResponseSchema,
  PaymentRequestGetBaseResponseSchema,
  PaymentRequestGetRequestSchema,
  PaymentRequestGetResponseSchema,
  PaymentRequestInvoiceDropdownGetRequestSchema,
  RejectPaymentRequestRequestSchema,
  RejectPaymentRequestResponseSchema,
} from '../schemas';
import { PaymentRequestDetailGetRequestSchema } from '../schemas/get-payment-request-detail.schema';

export type IPaymentRequestGetBaseResponseDto = z.infer<
  typeof PaymentRequestGetBaseResponseSchema
>;
export type IPaymentRequestGetResponseDto = z.infer<
  typeof PaymentRequestGetResponseSchema
>;
export type IPaymentRequestGetRequestDto = z.infer<
  typeof PaymentRequestGetRequestSchema
>;
export type IPaymentRequestGetFormDto = z.input<
  typeof PaymentRequestGetRequestSchema
>;

export type IPaymentRequestDetailGetResponseDto = z.infer<
  typeof PaymentRequestDetailGetResponseSchema
>;
export type IPaymentRequestDetailGetRequestDto = z.infer<
  typeof PaymentRequestDetailGetRequestSchema
>;

export type IAddPaymentRequestRequestDto = z.infer<
  typeof AddPaymentRequestRequestSchema
>;
export type IAddPaymentRequestFormDto = z.input<
  typeof AddPaymentRequestRequestSchema
>;
export type IAddPaymentRequestUIFormDto = IAddPaymentRequestFormDto & {
  projectName: string;
};
export type IAddPaymentRequestResponseDto = z.infer<
  typeof AddPaymentRequestResponseSchema
>;

export type IEditPaymentRequestRequestDto = z.infer<
  typeof EditPaymentRequestRequestSchema
>;
export type IEditPaymentRequestFormDto = z.input<
  typeof EditPaymentRequestRequestSchema
>;
export type IEditPaymentRequestUIFormDto = IAddPaymentRequestUIFormDto;
export type IEditPaymentRequestResponseDto = z.infer<
  typeof EditPaymentRequestResponseSchema
>;

export type IDeletePaymentRequestResponseDto = z.infer<
  typeof DeletePaymentRequestResponseSchema
>;

export type IApprovePaymentRequestRequestDto = z.infer<
  typeof ApprovePaymentRequestRequestSchema
>;
export type IApprovePaymentRequestFormDto = z.input<
  typeof ApprovePaymentRequestRequestSchema
>;
export type IApprovePaymentRequestResponseDto = z.infer<
  typeof ApprovePaymentRequestResponseSchema
>;

export type IRejectPaymentRequestRequestDto = z.infer<
  typeof RejectPaymentRequestRequestSchema
>;
export type IRejectPaymentRequestFormDto = z.input<
  typeof RejectPaymentRequestRequestSchema
>;
export type IRejectPaymentRequestResponseDto = z.infer<
  typeof RejectPaymentRequestResponseSchema
>;

export type IPaymentRequestInvoiceDropdownGetRequestDto = z.input<
  typeof PaymentRequestInvoiceDropdownGetRequestSchema
>;
