import { FilterSchema, isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';

import { BankTransferBaseSchema } from './base-bank-transfer.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const BankTransferGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({ projectName, contractorName, vendorName, docType, ...rest }) => ({
      ...rest,
      siteId: projectName,
      contractorId: contractorName,
      vendorId: vendorName,
      partyType: docType,
    })
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
  paymentAdvice: z.looseObject({
    id: uuidField,
    referenceNumber: z.string(),
    pdfKey: z.string().nullable(),
  }),
});

export const BankTransferGetResponseSchema = z.looseObject({
  records: z.array(BankTransferGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
