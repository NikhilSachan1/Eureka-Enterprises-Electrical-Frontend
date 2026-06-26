import { z } from 'zod';
import {
  CreatePaymentSheetRequestSchema,
  CreatePaymentSheetResponseSchema,
} from '../schemas/create-payment-sheet.schema';

export type ICreatePaymentSheetFormDto = z.input<
  typeof CreatePaymentSheetRequestSchema
>;
export type ICreatePaymentSheetResponseDto = z.infer<
  typeof CreatePaymentSheetResponseSchema
>;
