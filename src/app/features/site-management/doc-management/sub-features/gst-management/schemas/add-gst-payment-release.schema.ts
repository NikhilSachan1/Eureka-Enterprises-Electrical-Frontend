import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

export const AddGstPaymentReleaseRequestSchema = z
  .object({
    entryIds: z.array(uuidField).min(1),
    utrNumber: z.string(),
    paymentDate: dateField,
    fileKey: z.string(),
    fileName: z.string(),
    remarks: z.string().nullable(),
  })
  .strict()
  .transform(({ paymentDate, ...rest }) => ({
    ...rest,
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
