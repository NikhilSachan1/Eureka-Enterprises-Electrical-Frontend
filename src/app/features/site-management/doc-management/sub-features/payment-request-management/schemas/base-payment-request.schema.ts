import { uuidField } from '@shared/schemas';
import * as z from 'zod';

export const PaymentRequestUpsertShapeSchema = z
  .object({
    invoiceNumber: uuidField,
    requestedAmount: z.number().min(0.01),
    reason: z.string().trim().min(1),
    approvedAmount: z.number().min(0.01).nullable(),
    remarks: z.string().nullable(),
  })
  .strict();
