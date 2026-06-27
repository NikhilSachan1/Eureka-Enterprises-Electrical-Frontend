import { uuidField } from '@shared/schemas';
import z from 'zod';
import {
  EPaymentSheetBeneficiaryType,
  EPaymentSheetSourceType,
} from '../types/payment-sheet.enum';

export const CreatePaymentSheetRequestSchema = z
  .object({
    title: z.string().trim().max(255).nullable(),
    items: z.array(
      z.object({
        beneficiaryType: z.enum(EPaymentSheetBeneficiaryType),
        userId: uuidField.optional(),
        sourceType: z.enum(EPaymentSheetSourceType),
        requestedAmount: z.number(),
      })
    ),
  })
  .strict();

export const CreatePaymentSheetResponseSchema = z.looseObject({
  message: z.string(),
});
