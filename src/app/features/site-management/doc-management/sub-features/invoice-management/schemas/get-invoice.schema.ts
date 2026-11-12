import {
  dateField,
  AuditSchema,
  FilterSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import * as z from 'zod';
import { InvoiceBaseSchema } from './base-invoice.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { makeFieldsNullable, transformDateFormat } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdBy } = AuditSchema.shape;

export const InvoiceGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    approvalStatus: z.array(z.string()).nullable().optional(),
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

export const InvoiceAdvanceSettlementSchema = z.looseObject({
  settlementId: uuidField,
  advancePaymentId: uuidField,
  advanceNumber: z.string(),
  advanceDate: z.string().nullable().optional(),
  amount: z.union([z.string(), z.number()]),
  settledAt: z.string().nullable().optional(),
});

/** GST register status of the invoice (null until approved / when there is no GST). */
export const InvoiceGstStatusSchema = z.looseObject({
  entryId: uuidField,
  gstAmount: z.number(),
  isGstHold: z.boolean(),
  isVerified: z.boolean(),
  /** IN_PROCESS: vendor GST release booked, bank transfer not done yet. */
  settlementStatus: z.enum(['NOT_HELD', 'PENDING', 'IN_PROCESS', 'SETTLED']),
  settledAmount: z.number(),
  settledAt: z.string().nullable(),
});

/** TDS register status of the invoice (null until approved / when there is no TDS). */
export const InvoiceTdsStatusSchema = z.looseObject({
  tdsAmount: z.number(),
  depositedAmount: z.number(),
  verifiedAmount: z.number(),
  isDeposited: z.boolean(),
  isVerified: z.boolean(),
  lastDepositedAt: z.string().nullable(),
});

/**
 * Where the invoice's money stands, computed by the server. Paid + advance adjusted + held GST
 * settled + TDS cleared = total settled; invoice value − total settled = total balance.
 */
export const InvoicePaymentSummarySchema = z.looseObject({
  invoiceValue: z.number(),
  netPayable: z.number(),
  /** Purchase only; null on a sale invoice. */
  booked: z.number().nullable(),
  paid: z.number(),
  awaitingTransfer: z.number().nullable(),
  toBook: z.number().nullable(),
  advanceAdjusted: z.number(),
  paymentBalance: z.number(),
  gst: z
    .looseObject({
      amount: z.number(),
      isHeld: z.boolean(),
      status: z.enum(['NOT_HELD', 'PENDING', 'IN_PROCESS', 'SETTLED']),
      settled: z.number(),
      pending: z.number(),
      settledAt: z.string().nullable(),
    })
    .nullable(),
  tds: z
    .looseObject({
      amount: z.number(),
      cleared: z.number(),
      pending: z.number(),
      status: z.enum(['CLEARED', 'DEPOSITED', 'PENDING']),
    })
    .nullable(),
  totalSettled: z.number(),
  totalBalance: z.number(),
  settledPercent: z.number(),
});

export const InvoiceGetBaseResponseSchema = z.looseObject({
  ...InvoiceBaseSchema.shape,
  gstStatus: InvoiceGstStatusSchema.nullable().optional(),
  tdsStatus: InvoiceTdsStatusSchema.nullable().optional(),
  paymentSummary: InvoicePaymentSummarySchema.nullable().optional(),
  isLocked: z.boolean(),
  unlockRequestedAt: isoDateTimeField.nullable(),
  unlockRequestedByUser: makeFieldsNullable(UserSchema).nullable(),
  unlockReason: z.string().nullable(),
  remarks: z.string().nullable(),
  approvalStatus: z.string(),
  createdBy,
  bookedTotal: z.string(),
  paidTotal: z.string(),
  advanceSettledAmount: z.string(),
  advanceSettlements: z.array(InvoiceAdvanceSettlementSchema),
  jmc: z.looseObject({
    jmcNumber: z.string().nullable(),
    po: z.looseObject({
      poNumber: z.string(),
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

export const InvoiceGetResponseSchema = z.looseObject({
  records: z.array(InvoiceGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
