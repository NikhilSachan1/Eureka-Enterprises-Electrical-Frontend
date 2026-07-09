import { IEnhancedTable } from '@shared/types';
import { IVendorOutstandingGetBaseResponseDto } from './vendor-outstanding.dto';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

export type IVendorOutstandingInvoiceViewType = 'booked' | 'unbooked';

export type IVendorOutstandingUnbookedInvoice =
  IVendorOutstandingGetBaseResponseDto['unbookedInvoices'][number];

export interface IVendorBookPaymentTableRow extends Record<string, unknown> {
  id: string;
  vendorId: string;
  bookingDate: string;
  pendingAmount: number;
  transactionType?: 'credit' | 'debit';
  originalRawData: IVendorOutstandingBookPayment;
}

export interface IVendorInvoiceOutstandingGroup {
  id: string;
  invoiceId: string;
  viewType: IVendorOutstandingInvoiceViewType;
  invoiceNumber: string;
  invoiceDate: string;
  site: IVendorOutstandingBookPayment['site'];
  company: IVendorOutstandingBookPayment['company'];
  po: IVendorOutstandingBookPayment['po'];
  jmc: IVendorOutstandingBookPayment['jmc'];
  invoice: IVendorOutstandingBookPayment['invoice'] | null;
  bookPayments: IVendorBookPaymentTableRow[];
  opsTable: IEnhancedTable;
}

export interface IVendorOutstandingVendorGroup {
  id: string;
  vendorName: string;
  location: string;
  vendorSummary: IVendorOutstandingGetBaseResponseDto['vendorSummary'];
  invoiceGroups: IVendorInvoiceOutstandingGroup[];
}

export interface IVendorCardSummaryStat {
  kind: 'count' | 'currency';
  value: number;
  label: string;
  showDebit?: boolean;
  showToBook?: boolean;
}
