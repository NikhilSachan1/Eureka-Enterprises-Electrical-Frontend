import { IBankDetailsCellValue, IEnhancedTable } from '@shared/types';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { IPaymentSheetItemDetailDto } from './payment-sheet.dto';

export type IPaymentSheetItemVerificationView = NonNullable<
  IPaymentSheetItemDetailDto['verifications']
>[number];

export interface IPaymentSheetDetailItemRow {
  status: string;
  currentStage: string | null;
  itemStatus: string;
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

export interface IPaymentSheetOverviewVerificationView {
  verified: number;
  total: number;
  allVerified: boolean;
  stageLabel: string;
}

export interface IPaymentSheetOverviewView {
  stageLabel: string;
  createdAt: string;
  beneficiaryCount: number;
  verificationSummary: IPaymentSheetOverviewVerificationView | null;
  totalRequestedAmount: number;
  totalCurrentAmount: number;
  totalPaidAmount: number;
  pendingAmount: number;
  remarks: string | null;
}
