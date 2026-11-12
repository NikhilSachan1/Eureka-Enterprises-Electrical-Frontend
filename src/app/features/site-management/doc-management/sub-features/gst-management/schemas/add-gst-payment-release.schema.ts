import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import * as z from 'zod';

/**
 * Settle held GST from the GST summary.
 *   Vendor (purchase): books a GST release — `paymentDate` is the booking date; UTR and proof
 *   are captured later, on the bank transfer.
 *   Contractor (sale): records the GST bank transfer — UTR is required.
 */
export const AddGstPaymentReleaseRequestSchema = z
  .object({
    entryIds: z.array(uuidField).min(1),
    utrNumber: z.string().nullable().optional(),
    paymentDate: dateField,
    fileKey: z.string().nullable(),
    fileName: z.string().nullable(),
    remarks: z.string().nullable(),
  })
  .strict()
  .transform(({ paymentDate, utrNumber, ...rest }) => ({
    ...rest,
    ...(utrNumber?.trim() ? { utrNumber: utrNumber.trim() } : {}),
    paymentDate: transformDateFormat(paymentDate),
  }));

export const AddGstPaymentReleaseResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z
    .array(
      z.looseObject({
        message: z.string(),
        entryId: uuidField.optional(),
      })
    )
    .optional(),
  errors: z
    .array(
      z.looseObject({
        error: z.string().min(1),
        entryId: uuidField.optional(),
      })
    )
    .optional(),
});
