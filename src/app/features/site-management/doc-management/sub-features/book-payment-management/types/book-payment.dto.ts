import { z } from 'zod';
import {
  AddBookPaymentRequestSchema,
  AddBookPaymentResponseSchema,
  EditBookPaymentRequestSchema,
  EditBookPaymentResponseSchema,
  BookPaymentDetailGetResponseSchema,
  BookPaymentDetailGetRequestSchema,
  BookPaymentGetBaseResponseSchema,
  BookPaymentGetRequestSchema,
  BookPaymentGetResponseSchema,
  DeleteBookPaymentResponseSchema,
  BookPaymentDropdownGetRequestSchema,
  BookPaymentDropdownGetResponseSchema,
  BookPaymentDropdownRecordSchema,
  ApproveBookPaymentRequestSchema,
  ApproveBookPaymentResponseSchema,
  RejectBookPaymentRequestSchema,
  RejectBookPaymentResponseSchema,
  UnlockRequestBookPaymentRequestSchema,
  UnlockRequestBookPaymentResponseSchema,
  UnlockGrantBookPaymentResponseSchema,
  UnlockRejectBookPaymentResponseSchema,
} from '../schemas';

export type IBookPaymentGetBaseResponseDto = z.infer<
  typeof BookPaymentGetBaseResponseSchema
>;
export type IBookPaymentGetResponseDto = z.infer<
  typeof BookPaymentGetResponseSchema
>;
export type IBookPaymentGetFormDto = z.input<
  typeof BookPaymentGetRequestSchema
>;

export type IBookPaymentDetailGetResponseDto = z.infer<
  typeof BookPaymentDetailGetResponseSchema
>;
export type IBookPaymentDetailGetRequestDto = z.infer<
  typeof BookPaymentDetailGetRequestSchema
>;

export type IAddBookPaymentFormDto = z.input<
  typeof AddBookPaymentRequestSchema
>;
export type IAddBookPaymentUIFormDto = IAddBookPaymentFormDto & {
  projectName: string;
};
export type IAddBookPaymentResponseDto = z.infer<
  typeof AddBookPaymentResponseSchema
>;

export type IEditBookPaymentFormDto = z.input<
  typeof EditBookPaymentRequestSchema
>;
export type IEditBookPaymentUIFormDto = IEditBookPaymentFormDto & {
  projectName: string;
  invoiceNumber: string;
};
export type IEditBookPaymentResponseDto = z.infer<
  typeof EditBookPaymentResponseSchema
>;

export type IDeleteBookPaymentResponseDto = z.infer<
  typeof DeleteBookPaymentResponseSchema
>;

export type IBookPaymentDropdownRecordDto = z.infer<
  typeof BookPaymentDropdownRecordSchema
>;
export type IBookPaymentDropdownGetRequestDto = z.input<
  typeof BookPaymentDropdownGetRequestSchema
>;
export type IBookPaymentDropdownGetResponseDto = z.infer<
  typeof BookPaymentDropdownGetResponseSchema
>;

export type IApproveBookPaymentFormDto = z.input<
  typeof ApproveBookPaymentRequestSchema
>;
export type IApproveBookPaymentResponseDto = z.infer<
  typeof ApproveBookPaymentResponseSchema
>;

export type IRejectBookPaymentFormDto = z.input<
  typeof RejectBookPaymentRequestSchema
>;
export type IRejectBookPaymentResponseDto = z.infer<
  typeof RejectBookPaymentResponseSchema
>;

export type IUnlockRequestBookPaymentFormDto = z.input<
  typeof UnlockRequestBookPaymentRequestSchema
>;
export type IUnlockRequestBookPaymentResponseDto = z.infer<
  typeof UnlockRequestBookPaymentResponseSchema
>;

export type IUnlockGrantBookPaymentResponseDto = z.infer<
  typeof UnlockGrantBookPaymentResponseSchema
>;

export type IUnlockRejectBookPaymentResponseDto = z.infer<
  typeof UnlockRejectBookPaymentResponseSchema
>;
