import * as z from 'zod';
import {
  InvoiceLedgerGetRequestSchema,
  InvoiceLedgerGetResponseSchema,
  InvoiceLedgerInsightsSchema,
  InvoiceLedgerPaymentSchema,
  InvoiceLedgerRecordSchema,
  InvoiceLedgerTotalsSchema,
} from '../schemas/get-invoice-ledger.schema';

export type IInvoiceLedgerGetFormDto = z.input<
  typeof InvoiceLedgerGetRequestSchema
>;
export type IInvoiceLedgerGetResponseDto = z.infer<
  typeof InvoiceLedgerGetResponseSchema
>;
export type IInvoiceLedgerRecordDto = z.infer<typeof InvoiceLedgerRecordSchema>;
export type IInvoiceLedgerPaymentDto = z.infer<
  typeof InvoiceLedgerPaymentSchema
>;
export type IInvoiceLedgerTotalsDto = z.infer<typeof InvoiceLedgerTotalsSchema>;
export type IInvoiceLedgerInsightsDto = z.infer<
  typeof InvoiceLedgerInsightsSchema
>;
