import { FilterSchema, isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const VendorOutstandingGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict();

export const VendorOutstandingBankDetailsSchema = z.looseObject({
  accountHolderName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
});

export const VendorOutstandingVendorSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  city: z.string(),
  state: z.string(),
  bankDetails: VendorOutstandingBankDetailsSchema,
});

export const VendorOutstandingVendorSummarySchema = z.looseObject({
  totalNetPayableAmount: z.number(), //itna booked amount hai
  totalPaymentAmount: z.number(), //itna paid amount hai jo karna hai
  totalPendingToBook: z.number(),
});

export const VendorOutstandingSiteSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  city: z.string(),
  state: z.string(),
});

export const VendorOutstandingCompanySchema = z.looseObject({
  id: uuidField,
  name: z.string(),
});

export const VendorOutstandingJmcSchema = z.looseObject({
  id: uuidField,
  jmcNumber: z.string(),
  jmcDate: isoDateTimeField,
});

export const VendorOutstandingPoSchema = z.looseObject({
  id: uuidField,
  poNumber: z.string(),
  poDate: isoDateTimeField,
  totalAmount: z.number(),
});

export const VendorOutstandingBookPaymentInvoiceSchema = z.looseObject({
  id: uuidField,
  invoiceNumber: z.string(),
  invoiceDate: isoDateTimeField,
  totalAmount: z.number(),
  taxableAmount: z.number(),
  gstAmount: z.number(),
  gstPercentage: z.number(),
  tdsAmount: z.number(),
  tdsPercentage: z.number().optional(),
  isGstHold: z.boolean(),
  netPayableAmount: z.number(),
  bookedTotal: z.number(),
  paidTotal: z.number().optional(),
  pendingToBook: z.number(),
  approvalStatus: z.string(),
});

export const VendorOutstandingBookPaymentSchema = z.looseObject({
  id: uuidField,
  bookingDate: isoDateTimeField,
  taxableAmount: z.number(),
  gstAmount: z.number(),
  gstPercentage: z.number(),
  tdsAmount: z.number(),
  isGstHold: z.boolean(),
  netPayableAmount: z.number(),
  paymentTotalAmount: z.number(),
  paymentHoldAmount: z.number(),
  paymentHoldReason: z.string().nullable(),
  remarks: z.string().nullable(),
  approvalStatus: z.string(),
  hasTransfer: z.boolean(),
  displayName: z.string(),
  invoice: VendorOutstandingBookPaymentInvoiceSchema,
  jmc: VendorOutstandingJmcSchema,
  po: VendorOutstandingPoSchema,
  site: VendorOutstandingSiteSchema,
  company: VendorOutstandingCompanySchema,
});

export const VendorOutstandingUnbookedInvoiceSchema = z.looseObject({
  id: uuidField,
  invoiceNumber: z.string(),
  invoiceDate: isoDateTimeField,
  totalAmount: z.number(),
  jmc: VendorOutstandingJmcSchema,
  po: VendorOutstandingPoSchema,
  site: VendorOutstandingSiteSchema,
  company: VendorOutstandingCompanySchema,
});

export const VendorOutstandingGetBaseResponseSchema = z.looseObject({
  vendor: VendorOutstandingVendorSchema,
  vendorSummary: VendorOutstandingVendorSummarySchema,
  bookPayments: z.array(VendorOutstandingBookPaymentSchema),
  unbookedInvoices: z.array(VendorOutstandingUnbookedInvoiceSchema),
});

export const VendorOutstandingGetStatsResponseSchema = z.looseObject({
  totalPaymentAmount: z.number(),
  totalPendingToBook: z.number(),
});

export const VendorOutstandingGetResponseSchema = z.looseObject({
  records: z.array(VendorOutstandingGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
  summary: VendorOutstandingGetStatsResponseSchema,
});
