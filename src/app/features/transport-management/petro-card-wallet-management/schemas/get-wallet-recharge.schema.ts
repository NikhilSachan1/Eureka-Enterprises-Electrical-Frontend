import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';
import { WalletRechargeBaseSchema } from './base-wallet-recharge.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const WalletRechargeGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
    dateRange: z.array(dateField).min(1).optional(),
  })
  .strict()
  .transform(({ page: pageNumber, pageSize: size, search: term, dateRange }) => {
    const [start, end] = dateRange ?? [];

    return {
      page: pageNumber,
      pageSize: size,
      ...(term ? { search: term } : {}),
      ...(start && end
        ? {
            dateFrom: transformDateFormat(start),
            dateTo: transformDateFormat(end),
          }
        : {}),
    };
  });

export const WalletRechargeGetBaseResponseSchema = z.looseObject({
  ...WalletRechargeBaseSchema.shape,
  createdByUser: z
    .looseObject({
      id: uuidField,
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().optional(),
      employeeId: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const WalletRechargeGetResponseSchema = z.looseObject({
  records: z.array(WalletRechargeGetBaseResponseSchema),
  totalRecords: z.coerce.number().int().nonnegative(),
});
