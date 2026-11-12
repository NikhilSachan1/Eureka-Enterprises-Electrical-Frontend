import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { FilterSchema, uuidField } from '@shared/schemas';
import * as z from 'zod';

const { pageSize, page } = FilterSchema.shape;

export const PoBreakdownGetRequestSchema = z
  .object({
    siteId: z.array(uuidField).min(1),
    partyType: z.nativeEnum(EDocContext).optional(),
    page,
    pageSize,
  })
  .strict();

const PoBreakdownBankTransferSchema = z.looseObject({
  id: uuidField,
  utrNumber: z.string().nullable().optional(),
  transferDate: z.string().nullable().optional(),
  status: z.string(),
  transferAmount: z.coerce.number().nullable().optional(),
  /** REGULAR | GST (held GST released to the vendor / received from the client). */
  paymentType: z.string().nullable().optional(),
});

const PoBreakdownBookPaymentSchema = z.looseObject({
  id: uuidField,
  bookingDate: z.string().nullable().optional(),
  paymentTotalAmount: z.coerce.number(),
  status: z.string(),
  hasTransfer: z.coerce.boolean(),
  /** INVOICE | ADVANCE | GST_RELEASE */
  sourceType: z.string().nullable().optional(),
  bankTransfers: z.array(PoBreakdownBankTransferSchema).default([]),
});

/** GST register status of the invoice. */
const PoBreakdownInvoiceGstSchema = z.looseObject({
  gstAmount: z.coerce.number(),
  isGstHold: z.coerce.boolean(),
  isVerified: z.coerce.boolean(),
  settlementStatus: z.enum(['NOT_HELD', 'PENDING', 'IN_PROCESS', 'SETTLED']),
  settledAt: z.string().nullable().optional(),
});

/** TDS register status of the invoice. */
const PoBreakdownInvoiceTdsSchema = z.looseObject({
  tdsAmount: z.coerce.number(),
  isDeposited: z.coerce.boolean(),
  isVerified: z.coerce.boolean(),
  lastDepositedAt: z.string().nullable().optional(),
});

const PoBreakdownInvoiceSchema = z.looseObject({
  id: uuidField,
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable().optional(),
  status: z.string(),
  totalAmount: z.coerce.number(),
  paidTotal: z.coerce.number(),
  /** What the payment covers: taxable − TDS (GST held) / taxable + GST − TDS. */
  netPayable: z.coerce.number().optional(),
  advanceSettledAmount: z.coerce.number().optional(),
  /** Net payable less advance settled and paid. */
  remaining: z.coerce.number().optional(),
  gst: PoBreakdownInvoiceGstSchema.nullable().optional(),
  tds: PoBreakdownInvoiceTdsSchema.nullable().optional(),
  bookPayments: z.array(PoBreakdownBookPaymentSchema).default([]),
  bankTransfers: z.array(PoBreakdownBankTransferSchema).default([]),
});

/** Advance raised on the PO before any invoice — a sibling of the JMC branches. */
const PoBreakdownAdvanceSchema = z.looseObject({
  id: uuidField,
  advanceNumber: z.string().nullable(),
  advanceDate: z.string().nullable().optional(),
  amount: z.coerce.number(),
  settledAmount: z.coerce.number(),
  unsettled: z.coerce.number(),
  status: z.string(),
  hasUpload: z.coerce.boolean().optional(),
  bookedAmount: z.coerce.number().optional(),
  paidAmount: z.coerce.number().optional(),
  lastPaidAt: z.string().nullable().optional(),
  utrNumber: z.string().nullable().optional(),
});

const PoBreakdownReportSchema = z.looseObject({
  id: uuidField,
  reportNumber: z.string().nullable(),
  reportDate: z.string().nullable().optional(),
  status: z.string(),
});

const PoBreakdownJmcSchema = z.looseObject({
  id: uuidField,
  jmcNumber: z.string().nullable(),
  jmcDate: z.string().nullable().optional(),
  status: z.string(),
  hasReport: z.coerce.boolean().optional(),
  hasInvoice: z.coerce.boolean().optional(),
  report: PoBreakdownReportSchema.nullable(),
  invoice: PoBreakdownInvoiceSchema.nullable(),
});

export const PoBreakdownRecordSchema = z.looseObject({
  id: uuidField,
  poNumber: z.string(),
  poDate: z.string().nullable().optional(),
  partyType: z.nativeEnum(EDocContext),
  status: z.string(),
  totalAmount: z.coerce.number(),
  partyName: z.string().nullable(),
  advances: z.array(PoBreakdownAdvanceSchema).default([]),
  jmcs: z.array(PoBreakdownJmcSchema).default([]),
});

export const PoBreakdownGetResponseSchema = z.looseObject({
  records: z.array(PoBreakdownRecordSchema),
  totalRecords: z.coerce.number(),
});
