import { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import { IEnhancedTable } from '@shared/types';
import { IVendorOutstandingGetBaseResponseDto } from './vendor-outstanding.dto';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

export interface IVendorBookPaymentTableRow extends Record<string, unknown> {
  id: string;
  bookingDate: string;
  pendingAmount: number;
  transactionType?: 'credit' | 'debit';
  originalRawData: IVendorOutstandingBookPayment;
}

export interface IVendorInvoiceOutstandingGroup {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  companyName: string;
  siteName: string;
  siteLocation: string;
  invoice: IVendorOutstandingBookPayment['invoice'];
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
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
