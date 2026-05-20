import {
  dateField,
  FilterSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { PoBaseSchema } from './base-po.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { makeFieldsNullable, transformDateFormat } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const PoGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    approvalStatus: z.array(z.string()).nullable().optional(),
    dateRange: z.array(dateField).nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      projectName,
      companyName,
      docType,
      contractorName,
      vendorName,
      dateRange,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];
      return {
        ...rest,
        siteId: projectName,
        companyId: companyName,
        partyType: docType,
        contractorId: contractorName,
        vendorId: vendorName,
        dateFrom: transformDateFormat(start),
        dateTo: transformDateFormat(end),
      };
    }
  );

export const PoGetBaseResponseSchema = z.looseObject({
  ...PoBaseSchema.shape,
  isLocked: z.boolean(),
  unlockRequestedAt: isoDateTimeField.nullable(),
  unlockRequestedByUser: makeFieldsNullable(UserSchema).nullable(),
  unlockReason: z.string().nullable(),
  invoicedTotal: z.string(),
  bookedTotal: z.string(),
  paidTotal: z.string(),
  lastInvoiceAt: isoDateTimeField.nullable(),
  lastPaymentAt: isoDateTimeField.nullable(),
  remarks: z.string().nullable(),
  approvalStatus: z.string(),
  site: z.looseObject({
    name: z.string(),
    city: z.string(),
    state: z.string(),
    company: z.looseObject({
      name: z.string(),
    }),
  }),
  contractor: z
    .looseObject({
      name: z.string(),
    })
    .nullable(),
  vendor: z
    .looseObject({
      name: z.string(),
    })
    .nullable(),
});

export const PoGetResponseSchema = z.looseObject({
  records: z.array(PoGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
