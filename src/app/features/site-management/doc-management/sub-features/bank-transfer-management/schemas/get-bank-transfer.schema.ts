import {
  AuditSchema,
  dateField,
  FilterSchema,
  isoDateTimeField,
  uuidField,
} from '@shared/schemas';
import z from 'zod';

import { BankTransferBaseSchema } from './base-bank-transfer.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { transformDateFormat } from '@shared/utility';
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdBy } = AuditSchema.shape;

export const BankTransferGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    dateRange: z.array(dateField).nullable().optional(),
    poNumber: z.string().nullable().optional(),
    paidFromAccount: uuidField.optional(),
    hasPaidFromAccount: z
      .union([z.boolean(), z.literal('true'), z.literal('false')])
      .nullable()
      .optional(),
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
      contractorName,
      vendorName,
      docType,
      dateRange,
      paidFromAccount,
      hasPaidFromAccount,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];
      return {
        ...rest,
        siteId: projectName,
        companyId: companyName,
        contractorId: contractorName,
        vendorId: vendorName,
        partyType: docType,
        dateFrom: transformDateFormat(start),
        dateTo: transformDateFormat(end),
        paidFromAccountId: paidFromAccount,
        hasPaidFromAccount:
          hasPaidFromAccount === null || hasPaidFromAccount === undefined
            ? undefined
            : typeof hasPaidFromAccount === 'boolean'
              ? hasPaidFromAccount
              : hasPaidFromAccount === 'true',
      };
    }
  );

export const BankTransferGetBaseResponseSchema = z.looseObject({
  ...BankTransferBaseSchema.shape,
  site: z.looseObject({
    name: z.string(),
    city: z.string(),
    state: z.string(),
    company: z.looseObject({
      name: z.string(),
    }),
  }),
  vendor: z.looseObject({ name: z.string(), email: z.string() }).nullable(),
  contractor: z.looseObject({ name: z.string() }).nullable(),
  invoice: z
    .looseObject({
      id: uuidField.optional(),
      invoiceId: uuidField.optional(),
      invoiceNumber: z.string(),
      jmc: z.looseObject({
        jmcNumber: z.string(),
        po: z.looseObject({
          poNumber: z.string(),
        }),
      }),
    })
    .nullable(),
  bookPayment: z
    .looseObject({
      paymentTotalAmount: z.string(),
      createdAt: isoDateTimeField,
      invoice: z
        .looseObject({
          id: uuidField.optional(),
          invoiceId: uuidField.optional(),
          invoiceNumber: z.string(),
          jmc: z.looseObject({
            jmcNumber: z.string(),
            po: z.looseObject({
              poNumber: z.string(),
            }),
          }),
        })
        .nullable(),
    })
    .nullable(),
  paymentAdvice: z
    .looseObject({
      id: uuidField,
      referenceNumber: z.string(),
      pdfKey: z.string().nullable(),
    })
    .nullable(),
  createdBy,
});

export const BankTransferGetResponseSchema = z.looseObject({
  records: z.array(BankTransferGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
