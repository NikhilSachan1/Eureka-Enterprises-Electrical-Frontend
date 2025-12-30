import { isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';

export const AssetBaseSchema = z
  .object({
    id: uuidField,
    assetId: z.string().min(1),
    name: z.string(),
    model: z.string().nullable(),
    serialNumber: z.string().nullable(),
    category: z.string().min(1),
    assetType: z.string().min(1),
    calibrationFrom: z.string().min(1),
    calibrationFrequency: z.string().min(1),
    calibrationStartDate: isoDateTimeField,
    calibrationEndDate: isoDateTimeField,
    purchaseDate: isoDateTimeField,
    vendorName: z.string().min(1),
    warrantyStartDate: isoDateTimeField,
    warrantyEndDate: isoDateTimeField,
    status: z.string().min(1),
    remarks: z.string().trim(),
    additionalData: z.record(z.string(), z.string()).nullable(),
    calibrationStatus: z.string().min(1),
    warrantyStatus: z.string().min(1),
  })
  .strict();
