import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
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
}

export interface IVendorOutstandingVendorGroup {
  id: string;
  vendorName: string;
  location: string;
  vendorSummary: IVendorOutstandingGetBaseResponseDto['vendorSummary'];
  invoiceGroups: IVendorInvoiceOutstandingGroup[];
}

export interface IVendorOutstandingInvoiceListRow extends Record<string, unknown> {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  docWorkspaceContext: IDocWorkspaceContextView;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  taxableAmount: number | null;
  tdsAmount: number | null;
  tdsPercentage: number | string | null;
  gstAmount: number | null;
  gstPercentage: number | string | null;
  totalAmount: number | null;
  isGstHold: boolean;
  netPayableAmount: number | null;
  bookedTotal: number | null;
  paidTotal: number | null;
  pendingToBook: number | null;
  bookPayments: IVendorBookPaymentTableRow[];
  canBookPayment: boolean;
}

export interface IVendorOutstandingVendorTableRow extends Record<string, unknown> {
  id: string;
  vendorName: string;
  location: string;
  toBeBooked: number;
  bookedAmount: number;
  invoiceCount: number;
  bookingCount: number;
  invoiceRows: IVendorOutstandingInvoiceListRow[];
}
