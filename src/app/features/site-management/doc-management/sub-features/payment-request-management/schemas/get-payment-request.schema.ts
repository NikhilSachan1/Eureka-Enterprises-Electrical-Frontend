import {
  AuditSchema,
  dateField,
  FilterSchema,
  uuidField,
} from '@shared/schemas';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import z from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdBy } = AuditSchema.shape;

export const PaymentRequestGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    approvalStatus: z.array(z.string()).nullable().optional(),
    invoiceId: uuidField.nullable().optional(),
    dateRange: z.array(dateField).nullable().optional(),
    poNumber: z.string().nullable().optional(),
    docType: z.enum(EDocContext).optional(),
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
      approvalStatus,
      invoiceId,
      page,
      pageSize,
      search,
    }) => {
      const [status] = approvalStatus ?? [];
      return {
        siteId: projectName ? [projectName] : undefined,
        invoiceId: invoiceId || undefined,
        status: status || undefined,
        page,
        pageSize,
        search: search || undefined,
      };
    }
  );

const moneyField = z.union([z.string(), z.number()]);

export const PaymentRequestGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  status: z.string(),
  requestedAmount: moneyField,
  approvedAmount: moneyField.nullable().optional(),
  reason: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  bookPaymentId: uuidField.nullable().optional(),
  invoiceId: uuidField.optional(),
  siteId: uuidField.optional(),
  createdBy,
  invoice: z
    .looseObject({
      id: uuidField.optional(),
      invoiceNumber: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  site: z
    .looseObject({
      name: z.string(),
      city: z.string(),
      state: z.string(),
      company: z
        .looseObject({
          name: z.string(),
        })
        .nullable()
    })
    .optional(),
  vendor: z
    .looseObject({
      name: z.string(),
    })
    .nullable()
    .optional(),
  contractor: z
    .looseObject({
      name: z.string(),
    })
    .nullable()
    .optional(),
});

export const PaymentRequestGetResponseSchema = z.looseObject({
  records: z.array(PaymentRequestGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
