import { uuidField } from '@shared/schemas';
import z from 'zod';
import {
  EPaymentSheetBeneficiaryType,
  EPaymentSheetSourceType,
} from '../types/payment-sheet.enum';

export const PaymentSheetItemInputSchema = z.object({
  beneficiaryType: z.enum(EPaymentSheetBeneficiaryType),
  userId: uuidField.optional(),
  vendorId: uuidField.optional(),
  sourceType: z.enum(EPaymentSheetSourceType),
  requestedAmount: z.number().optional(),
  bookPaymentIds: z.array(uuidField).optional(),
});
