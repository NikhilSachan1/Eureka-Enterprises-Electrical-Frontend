import * as z from 'zod';
import { uuidField } from '@shared/schemas';

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
