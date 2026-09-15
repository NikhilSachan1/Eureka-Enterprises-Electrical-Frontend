import { z } from 'zod';
import {
  AddAdvancePaymentRequestSchema,
  AddAdvancePaymentResponseSchema,
  ApproveAdvancePaymentRequestSchema,
  ApproveAdvancePaymentResponseSchema,
  DeleteAdvancePaymentResponseSchema,
  EditAdvancePaymentRequestSchema,
  EditAdvancePaymentResponseSchema,
  AdvancePaymentDetailGetResponseSchema,
  AdvancePaymentGetBaseResponseSchema,
  AdvancePaymentGetRequestSchema,
  AdvancePaymentGetResponseSchema,
  RejectAdvancePaymentRequestSchema,
  RejectAdvancePaymentResponseSchema,
} from '../schemas';
import { AdvancePaymentDetailGetRequestSchema } from '../schemas/get-advance-payment-detail.schema';

export type IAdvancePaymentGetBaseResponseDto = z.infer<
  typeof AdvancePaymentGetBaseResponseSchema
>;
export type IAdvancePaymentGetResponseDto = z.infer<
  typeof AdvancePaymentGetResponseSchema
>;
export type IAdvancePaymentGetRequestDto = z.infer<
  typeof AdvancePaymentGetRequestSchema
>;
export type IAdvancePaymentGetFormDto = z.input<
  typeof AdvancePaymentGetRequestSchema
>;

export type IAdvancePaymentDetailGetResponseDto = z.infer<
  typeof AdvancePaymentDetailGetResponseSchema
>;
export type IAdvancePaymentDetailGetRequestDto = z.infer<
  typeof AdvancePaymentDetailGetRequestSchema
>;

export type IAddAdvancePaymentRequestDto = z.infer<
  typeof AddAdvancePaymentRequestSchema
>;
export type IAddAdvancePaymentFormDto = z.input<
  typeof AddAdvancePaymentRequestSchema
>;
export type IAddAdvancePaymentUIFormDto = Omit<
  IAddAdvancePaymentFormDto,
  'fileKey' | 'fileName'
> & {
  projectName: string;
  advanceAttachment: File[];
};
export type IAddAdvancePaymentResponseDto = z.infer<
  typeof AddAdvancePaymentResponseSchema
>;

export type IEditAdvancePaymentRequestDto = z.infer<
  typeof EditAdvancePaymentRequestSchema
>;
export type IEditAdvancePaymentFormDto = z.input<
  typeof EditAdvancePaymentRequestSchema
>;
export type IEditAdvancePaymentUIFormDto = IAddAdvancePaymentUIFormDto;
export type IEditAdvancePaymentResponseDto = z.infer<
  typeof EditAdvancePaymentResponseSchema
>;

export type IDeleteAdvancePaymentResponseDto = z.infer<
  typeof DeleteAdvancePaymentResponseSchema
>;

export type IApproveAdvancePaymentRequestDto = z.infer<
  typeof ApproveAdvancePaymentRequestSchema
>;
export type IApproveAdvancePaymentFormDto = z.input<
  typeof ApproveAdvancePaymentRequestSchema
>;
export type IApproveAdvancePaymentResponseDto = z.infer<
  typeof ApproveAdvancePaymentResponseSchema
>;

export type IRejectAdvancePaymentRequestDto = z.infer<
  typeof RejectAdvancePaymentRequestSchema
>;
export type IRejectAdvancePaymentFormDto = z.input<
  typeof RejectAdvancePaymentRequestSchema
>;
export type IRejectAdvancePaymentResponseDto = z.infer<
  typeof RejectAdvancePaymentResponseSchema
>;
