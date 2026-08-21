import {
  FilterSchema,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import z from 'zod';

const { pageSize, page, search } = FilterSchema.shape;

export const PaymentRequestGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    approvalStatus: z.array(z.string()).nullable().optional(),
    invoiceId: uuidField.nullable().optional(),
    pageSize,
    page,
    search,
  })
  .transform(
    ({ projectName, approvalStatus, invoiceId, page, pageSize, search }) => {
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

export const PaymentRequestGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  invoiceId: uuidField,
  siteId: uuidField,
  status: z.string(),
  requestedAmount: z.string(),
  approvedAmount: z.string().nullable(),
  reason: z.string().nullable(),
  invoice: z.looseObject({
    id: uuidField,
    invoiceNumber: z.string(),
    invoiceDate: onlyDateStringField,
    taxableAmount: z.string(),
    tdsAmount: z.string(),
    gstAmount: z.string(),
    totalAmount: z.string(),
  }),
  po: z.looseObject({
    poNumber: z.string(),
    poDate: onlyDateStringField,
    taxableAmount: z.string(),
    gstAmount: z.string(),
    totalAmount: z.string(),
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

export const PaymentRequestGetResponseSchema = z.looseObject({
  records: z.array(PaymentRequestGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
