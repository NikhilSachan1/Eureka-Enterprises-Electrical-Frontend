import { IBankDetailsCellValue, IEnhancedTable } from '@shared/types';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { IPaymentSheetItemDetailDto } from './payment-sheet.dto';

export type IPaymentSheetItemVerificationView = NonNullable<
  IPaymentSheetItemDetailDto['verifications']
>[number];

export interface IPaymentSheetDetailItemRow {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryCode: string;
  actualDue: number;
  payableAmount: number;
  remainingAmount: number;
  paidAt: string | null;
  paymentRef: string | null;
  bankDetails: IBankDetailsCellValue | null;
  companyName?: string;
  projectName?: string;
  projectCity?: string;
  projectState?: string;
  invoiceNumber?: string;
  invoiceDate?: string | null;
  verifications: IPaymentSheetItemVerificationView[];
  verifiedStages: string[];
  isVerifiedForCurrentStage: boolean;
}
export interface IPaymentSheetDetailSourceGroupView {
  sourceType: EPaymentOutstandingSourceType;
  recordCount: number;
  totalCurrentAmount: number;
  table: IEnhancedTable;
}
