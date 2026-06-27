import { z } from 'zod';
import {
  CreatePaymentSheetRequestSchema,
  CreatePaymentSheetResponseSchema,
} from '../schemas/create-payment-sheet.schema';
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
