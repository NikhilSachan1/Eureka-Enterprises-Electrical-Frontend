import { FilterSchema, isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';

const { pageSize, page, search, sortOrder, sortField } = FilterSchema.shape;

export const PaymentSheetGetRequestSchema = z
  .object({
    paymentSheetStatus: z.string().optional(),
    paymentSheetType: z.string().optional(),
    sortField,
    page,
    pageSize,
    sortOrder,
    search,
  })
  .strict()
  .transform(({ paymentSheetStatus, ...rest }) => {
    return {
      ...rest,
      status: paymentSheetStatus,
    };
  });

export const PaymentSheetGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  createdAt: isoDateTimeField,
  sheetNumber: z.string(),
  title: z.string().nullable(),
  status: z.string(),
  currentStage: z.string().nullable(),
  totalCurrentAmount: z.coerce.number(),
  totalPaidAmount: z.coerce.number(),
});

export const PaymentSheetGetStatsSchema = z.looseObject({
  draft: z.coerce.number().int().nonnegative(),
  hrReview: z.coerce.number().int().nonnegative(),
  adminReview: z.coerce.number().int().nonnegative(),
  processing: z.coerce.number().int().nonnegative(),
  completed: z.coerce.number().int().nonnegative(),
  returned: z.coerce.number().int().nonnegative(),
  rejected: z.coerce.number().int().nonnegative(),
  cancelled: z.coerce.number().int().nonnegative(),
  total: z.coerce.number().int().nonnegative(),
});

export const PaymentSheetGetResponseSchema = z.looseObject({
  records: z.array(PaymentSheetGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
  stats: PaymentSheetGetStatsSchema,
});
