import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { FilterSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';

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
});

const PoBreakdownBookPaymentSchema = z.looseObject({
  id: uuidField,
  bookingDate: z.string().nullable().optional(),
  paymentTotalAmount: z.coerce.number(),
  status: z.string(),
  hasTransfer: z.coerce.boolean(),
  bankTransfers: z.array(PoBreakdownBankTransferSchema).default([]),
});

const PoBreakdownInvoiceSchema = z.looseObject({
  id: uuidField,
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable().optional(),
  status: z.string(),
  totalAmount: z.coerce.number(),
  paidTotal: z.coerce.number(),
  remaining: z.coerce.number().optional(),
  bookPayments: z.array(PoBreakdownBookPaymentSchema).default([]),
  bankTransfers: z.array(PoBreakdownBankTransferSchema).default([]),
});

const PoBreakdownReportSchema = z.looseObject({
  id: uuidField,
  reportNumber: z.string().nullable(),
  reportDate: z.string().nullable().optional(),
  status: z.string(),
});

const PoBreakdownJmcSchema = z.looseObject({
  id: uuidField,
  jmcNumber: z.string(),
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
  jmcs: z.array(PoBreakdownJmcSchema).default([]),
});

export const PoBreakdownGetResponseSchema = z.looseObject({
  records: z.array(PoBreakdownRecordSchema),
  totalRecords: z.coerce.number(),
});
