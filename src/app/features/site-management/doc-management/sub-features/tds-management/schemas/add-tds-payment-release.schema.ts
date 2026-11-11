import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import * as z from 'zod';

/** Record a TDS challan (ITNS 281) deposited with the government — purchase side only. */
export const AddTdsPaymentReleaseRequestSchema = z
  .object({
    entryIds: z.array(uuidField).min(1),
    bsrCode: z.string().trim().min(1),
    challanSerialNumber: z.string().trim().min(1),
    utrNumber: z
      .string()
      .nullable()
      .optional()
      .transform(value => (value?.trim() ? value.trim() : undefined)),
    paymentDate: dateField,
    fileKey: z.string().nullable(),
    fileName: z.string().nullable(),
    remarks: z.string().nullable(),
  })
  .strict()
  .transform(({ paymentDate, ...rest }) => ({
    ...rest,
    paymentDate: transformDateFormat(paymentDate),
  }));

export const AddTdsPaymentReleaseResponseSchema = z.looseObject({
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
