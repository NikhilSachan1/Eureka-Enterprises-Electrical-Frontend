import { dateField, uuidField } from '@shared/schemas';
import z from 'zod';

export const AdvancePaymentUpsertShapeSchema = z
  .object({
    poNumber: uuidField,
    vendorAdvanceNumber: z.string().trim().min(1),
    amount: z.number().min(0.01),
    advanceDate: dateField,
    fileKey: z.string().nullable(),
    fileName: z.string().nullable(),
    approvedAmount: z.number().min(0.01).nullable(),
    remarks: z.string().nullable(),
  })
  .strict();
