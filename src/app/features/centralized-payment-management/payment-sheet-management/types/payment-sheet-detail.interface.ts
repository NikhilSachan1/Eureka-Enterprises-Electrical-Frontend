import { IBankDetailsCellValue, IEnhancedTable } from '@shared/types';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';

export interface IPaymentSheetDetailItemRow {
  id: string;
  beneficiaryName: string;
  beneficiaryCode: string;
  actualDue: number;
  payableAmount: number;
  itemStatus: string;
  paidAt: string | null;
  paymentRef: string | null;
  bankDetails: IBankDetailsCellValue | null;
}
export interface IPaymentSheetDetailSourceGroupView {
  sourceType: EPaymentOutstandingSourceType;
  recordCount: number;
  totalCurrentAmount: number;
  table: IEnhancedTable;
}
