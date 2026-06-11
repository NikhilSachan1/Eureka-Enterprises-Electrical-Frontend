export interface IBookPaymentInvoiceDropdownMeta {
  taxableAmount: number;
  gstAmount: number;
  tdsAmount: number;
  totalAmount: number;
  bookedTotal?: number;
  paidTotal?: number;
  remaining?: number;
}
