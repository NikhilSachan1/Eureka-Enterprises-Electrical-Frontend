import { FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const VendorOutstandingGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict();

export const VendorOutstandingBankDetailsSchema = z.looseObject({
  bankHolderName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
});

export const VendorOutstandingGetBaseResponseSchema = z.looseObject({
  vendorId: uuidField,
  vendorName: z.string(),
  pendingAmount: z.number(),
  bankDetails: VendorOutstandingBankDetailsSchema.nullable(),
});

export const VendorOutstandingGetStatsResponseSchema = z.looseObject({
  totalPendingAmount: z.number(),
});

export const VendorOutstandingGetResponseSchema = z.looseObject({
  records: z.array(VendorOutstandingGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
  summary: VendorOutstandingGetStatsResponseSchema,
});
