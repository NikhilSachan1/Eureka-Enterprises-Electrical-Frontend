import { FilterSchema, onlyDateStringField, uuidField } from '@shared/schemas';
import z from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const BookPaymentGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ projectName, contractorName, vendorName, ...rest }) => ({
    ...rest,
    siteId: projectName,
    contractorId: contractorName,
    vendorId: vendorName,
  }));

export const BookPaymentGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  siteId: uuidField,
  invoiceId: uuidField,
  bookingDate: onlyDateStringField,
  taxableAmount: z.string(),
  gstAmount: z.string(),
  gstPercentage: z.string(),
  tdsDeductionAmount: z.string(),
  tdsPercentage: z.string(),
  paymentTotalAmount: z.string(),
  paymentHoldReason: z.string().nullable(),
  remarks: z.string().nullable(),
  hasTransfer: z.boolean(),
  invoice: z.looseObject({
    invoiceNumber: z.string(),
    jmc: z.looseObject({
      jmcNumber: z.string(),
      po: z.looseObject({
        poNumber: z.string(),
      }),
    }),
  }),
  site: z.looseObject({
    name: z.string(),
    city: z.string(),
    state: z.string(),
    company: z.looseObject({
      name: z.string(),
    }),
  }),
  vendor: z.looseObject({
    name: z.string(),
  }),
});

export const BookPaymentGetResponseSchema = z.looseObject({
  records: z.array(BookPaymentGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
