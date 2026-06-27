import { uuidField } from '@shared/schemas';
import z from 'zod';
import {
  EPaymentSheetBeneficiaryType,
  EPaymentSheetSourceType,
} from '../types/payment-sheet.enum';

export const PaymentSheetItemInputSchema = z.object({
  beneficiaryType: z.enum(EPaymentSheetBeneficiaryType),
  userId: uuidField,
  sourceType: z.enum(EPaymentSheetSourceType),
  requestedAmount: z.number(),
  bookPaymentIds: z.array(uuidField).optional(),
});
