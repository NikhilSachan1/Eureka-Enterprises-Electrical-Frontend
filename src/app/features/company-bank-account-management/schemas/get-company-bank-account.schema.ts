import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { CompanyBankAccountBaseSchema } from './base-company-bank-account.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const CompanyBankAccountGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ sortOrder: _sortOrder, ...rest }) => {
    return {
      ...rest,
    };
  });

export const CompanyBankAccountGetBaseResponseSchema = z.looseObject({
  ...CompanyBankAccountBaseSchema.shape,
  ...AuditSchema.shape,
});

export const CompanyBankAccountGetResponseSchema = z.looseObject({
  records: z.array(CompanyBankAccountGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
