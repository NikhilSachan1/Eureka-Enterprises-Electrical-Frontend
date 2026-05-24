import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

export const AddGstPaymentReleaseRequestSchema = z
  .object({
    projectName: uuidField,
    vendorName: uuidField,
    utrNumber: z.string(),
    paymentDate: dateField,
    fileKey: z.string(),
    fileName: z.string(),
    remarks: z.string().nullable(),
  })
  .strict()
  .transform(
    ({ projectName, vendorName, paymentDate, fileKey, fileName, ...rest }) => ({
      siteId: projectName,
      vendorId: vendorName,
      paymentDate: transformDateFormat(paymentDate),
      fileKey,
      fileName,
      ...rest,
    })
  );

export const AddGstPaymentReleaseResponseSchema = z.looseObject({
  message: z.string(),
});
