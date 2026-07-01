import { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import { IEnhancedTable } from '@shared/types';
import { IVendorOutstandingGetBaseResponseDto } from './vendor-outstanding.dto';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

export interface IVendorBookPaymentTableRow extends Record<string, unknown> {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  bookingDate: string;
  pendingAmount: number;
  transactionType?: 'credit' | 'debit';
  originalRawData: IVendorOutstandingBookPayment;
}

export interface IVendorOutstandingVendorGroup {
  id: string;
  vendorName: string;
  location: string;
  vendorSummary: IVendorOutstandingGetBaseResponseDto['vendorSummary'];
  bookPaymentTable: IEnhancedTable;
  originalRawData: IVendorOutstandingGetBaseResponseDto;
}
