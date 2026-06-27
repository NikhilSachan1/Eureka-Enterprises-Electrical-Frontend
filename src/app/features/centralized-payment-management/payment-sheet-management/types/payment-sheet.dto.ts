import { z } from 'zod';
import {
  CreatePaymentSheetRequestSchema,
  CreatePaymentSheetResponseSchema,
} from '../schemas/create-payment-sheet.schema';
import {
  DeletePaymentSheetItemRequestSchema,
  DeletePaymentSheetItemResponseSchema,
} from '../schemas/delete-payment-sheet-item.schema';
import {
  PaymentSheetDetailGetRequestSchema,
  PaymentSheetDetailGetResponseSchema,
  PaymentSheetItemDetailSchema,
} from '../schemas/get-payment-sheet-detail.schema';
import {
  PaymentSheetGetBaseResponseSchema,
  PaymentSheetGetRequestSchema,
  PaymentSheetGetResponseSchema,
} from '../schemas/get-payment-sheet.schema';

export type ICreatePaymentSheetFormDto = z.input<
  typeof CreatePaymentSheetRequestSchema
>;
export type ICreatePaymentSheetResponseDto = z.infer<
  typeof CreatePaymentSheetResponseSchema
>;

export type ICreatePaymentSheetUIFormDto = Required<
  Pick<ICreatePaymentSheetFormDto, 'title'>
>;

export type IPaymentSheetGetBaseResponseDto = z.infer<
  typeof PaymentSheetGetBaseResponseSchema
>;
export type IPaymentSheetGetFormDto = z.input<
  typeof PaymentSheetGetRequestSchema
>;
export type IPaymentSheetGetResponseDto = z.infer<
  typeof PaymentSheetGetResponseSchema
>;

export type IPaymentSheetDetailGetFormDto = z.input<
  typeof PaymentSheetDetailGetRequestSchema
>;
export type IPaymentSheetDetailGetResponseDto = z.infer<
  typeof PaymentSheetDetailGetResponseSchema
>;
export type IPaymentSheetItemDetailDto = z.infer<
  typeof PaymentSheetItemDetailSchema
>;

export type IDeletePaymentSheetItemFormDto = z.input<
  typeof DeletePaymentSheetItemRequestSchema
>;
export type IDeletePaymentSheetItemResponseDto = z.infer<
  typeof DeletePaymentSheetItemResponseSchema
>;
