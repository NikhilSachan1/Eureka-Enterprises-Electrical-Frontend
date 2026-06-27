import { IBankDetailsCellValue } from '@features/centralized-payment-management/shared/types/bank-details-cell.interface';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { IEnhancedTable } from '@shared/types';

export interface IPaymentSheetDetailItemRow {
  beneficiaryName: string;
  beneficiaryCode: string;
  actualDue: number;
  payableAmount: number;
  itemStatus: string;
  bankDetails: IBankDetailsCellValue | null;
}
export interface IPaymentSheetDetailSourceGroupView {
  sourceType: EPaymentOutstandingSourceType;
  recordCount: number;
  totalCurrentAmount: number;
  table: IEnhancedTable;
}
