import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  dateField,
  AuditSchema,
  FilterSchema,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdBy } = AuditSchema.shape;

export const BookPaymentGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    dateRange: z.array(dateField).nullable().optional(),
    poNumber: z.string().nullable().optional(),
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
      };
    }
  );

export const BookPaymentGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  siteId: uuidField,
  invoiceId: uuidField,
  bookingDate: onlyDateStringField,
  taxableAmount: z.string(),
  paymentTotalAmount: z.string(),
  paymentHoldReason: z.string().nullable(),
  remarks: z.string().nullable(),
  hasTransfer: z.boolean(),
  createdBy,
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
