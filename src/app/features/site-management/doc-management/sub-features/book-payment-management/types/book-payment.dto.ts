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
  paymentTotalAmount: number;
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
  paymentTotalAmount: number;
};
export type IEditBookPaymentResponseDto = z.infer<
  typeof EditBookPaymentResponseSchema
>;

export type IDeleteBookPaymentResponseDto = z.infer<
  typeof DeleteBookPaymentResponseSchema
>;
