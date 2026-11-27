import * as z from 'zod';
import { uuidField } from '@shared/schemas';
import { EPaymentRecordMode } from '../types/payment-sheet.enum';

/** UI choice on Reimburse / Bank Transfer — picks the endpoint, never sent in the body. */
export const PaymentRecordModeField = z.enum(EPaymentRecordMode);

/**
 * Sheet auto-created by a direct Reimburse / Bank Transfer. Null when the payment went through
 * but the sheet could not be written (the response message says so).
 */
export const DirectPaymentSheetRefSchema = z
  .looseObject({
    id: uuidField,
    sheetNumber: z.string(),
  })
  .nullable()
  .optional();
