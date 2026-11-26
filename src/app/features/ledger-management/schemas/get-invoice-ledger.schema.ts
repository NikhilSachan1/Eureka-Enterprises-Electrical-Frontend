import * as z from 'zod';
import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import {
  EInvoiceLedgerAgeingBucket,
  EInvoiceLedgerPaymentStatus,
  EInvoiceLedgerQuarter,
  EInvoiceLedgerSide,
} from '../types/invoice-ledger.enum';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

/**
 * Filter form + table state → ledger query. `partyType` only decides whether the party filter is
 * sent as contractorId or vendorId; the side itself is the URL (contractor / vendor ledger).
 */
export const InvoiceLedgerGetRequestSchema = z
  .object({
    partyType: z.enum(EInvoiceLedgerSide),
    projectName: z.array(uuidField).nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    partyName: z.array(uuidField).nullable().optional(),
    financialYear: z.string().nullable().optional(),
    quarter: z.array(z.enum(EInvoiceLedgerQuarter)).nullable().optional(),
    paymentStatus: z
      .array(z.enum(EInvoiceLedgerPaymentStatus))
      .nullable()
      .optional(),
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
      partyType,
      projectName,
      companyName,
      partyName,
      dateRange,
      financialYear,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];
      const isContractor = partyType === EInvoiceLedgerSide.CONTRACTOR;
      return {
        ...rest,
        siteId: projectName ?? undefined,
        companyId: companyName ?? undefined,
        contractorId: isContractor ? (partyName ?? undefined) : undefined,
        vendorId: isContractor ? undefined : (partyName ?? undefined),
        financialYear: financialYear ?? undefined,
        dateFrom: start ? transformDateFormat(start) : undefined,
        dateTo: end ? transformDateFormat(end) : undefined,
      };
    }
  );

export const InvoiceLedgerPaymentSchema = z.looseObject({
  date: z.string(),
  amount: z.number(),
});

export const InvoiceLedgerRecordSchema = z.looseObject({
  id: uuidField,
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  financialYear: z.string().nullable(),
  quarter: z.string().nullable(),
  isGstHold: z.boolean(),
  gstPercentage: z.number().nullable(),
  tdsPercentage: z.number().nullable(),
  taxableAmount: z.number(),
  cgstAmount: z.number(),
  sgstAmount: z.number(),
  igstAmount: z.number(),
  gstAmount: z.number(),
  grossAmount: z.number(),
  tdsAmount: z.number(),
  advanceAdjusted: z.number(),
  paidAmount: z.number(),
  outstandingAmount: z.number(),
  paymentStatus: z.enum(EInvoiceLedgerPaymentStatus),
  poNumber: z.string().nullable(),
  siteName: z.string(),
  siteCity: z.string().nullable().optional(),
  siteState: z.string().nullable().optional(),
  companyName: z.string().nullable(),
  partyName: z.string().nullable(),
  payments: z.array(InvoiceLedgerPaymentSchema),
});

export const InvoiceLedgerTotalsSchema = z.looseObject({
  taxableAmount: z.number(),
  cgstAmount: z.number(),
  sgstAmount: z.number(),
  igstAmount: z.number(),
  gstAmount: z.number(),
  grossAmount: z.number(),
  tdsAmount: z.number(),
  netPayable: z.number(),
  advanceAdjusted: z.number(),
  paidAmount: z.number(),
  outstandingAmount: z.number(),
});

export const InvoiceLedgerInsightsSchema = z.looseObject({
  /** Latest 12 invoice months, oldest first. */
  byMonth: z.array(
    z.looseObject({
      month: z.string(),
      billed: z.number(),
      outstanding: z.number(),
    })
  ),
  /** Five contractors / vendors with the most outstanding. */
  topParties: z.array(
    z.looseObject({
      partyName: z.string(),
      count: z.number(),
      outstanding: z.number(),
    })
  ),
  // Defaults keep the page working against a backend that does not send these yet.
  /** Invoice count per payment status. */
  statusMix: z
    .array(
      z.looseObject({
        status: z.enum(EInvoiceLedgerPaymentStatus),
        count: z.number(),
        gross: z.number().default(0),
        outstanding: z.number(),
      })
    )
    .default([]),
  /** Outstanding by age of the invoice. */
  ageing: z
    .array(
      z.looseObject({
        bucket: z.enum(EInvoiceLedgerAgeingBucket),
        count: z.number(),
        outstanding: z.number(),
      })
    )
    .default([]),
  /** Days since the oldest invoice that still has something outstanding. */
  oldestOutstandingDays: z.number().nullable().default(null),
});

export const InvoiceLedgerGetResponseSchema = z.looseObject({
  records: z.array(InvoiceLedgerRecordSchema),
  totalRecords: z.number().int().nonnegative(),
  totals: InvoiceLedgerTotalsSchema,
  insights: InvoiceLedgerInsightsSchema.optional(),
});
