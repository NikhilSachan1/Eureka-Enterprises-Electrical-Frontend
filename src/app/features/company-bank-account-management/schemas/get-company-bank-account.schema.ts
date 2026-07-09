import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { CompanyBankAccountBaseSchema } from './base-company-bank-account.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const CompanyBankAccountGetRequestSchema = z
  .object({
    bankStatus: z
      .union([z.boolean(), z.literal('true'), z.literal('false')])
      .optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ bankStatus, sortOrder: _sortOrder, ...rest }) => ({
    ...rest,
    isActive:
      bankStatus === undefined
        ? undefined
        : typeof bankStatus === 'boolean'
          ? bankStatus
          : bankStatus === 'true',
  }));

export const CompanyBankAccountGetBaseResponseSchema = z.looseObject({
  ...CompanyBankAccountBaseSchema.shape,
  ...AuditSchema.shape,
});

export const CompanyBankAccountGetResponseSchema = z.looseObject({
  records: z.array(CompanyBankAccountGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
