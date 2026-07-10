import { IBankDetailsCellValue, IEnhancedTable } from '@shared/types';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import {
  IPaymentSheetItemDetailDto,
  IPaymentSheetDetailGetResponseDto,
} from './payment-sheet.dto';
import { EPaymentSheetTimelineMode } from './payment-sheet.enum';

export type IPaymentSheetItemVerificationView = NonNullable<
  IPaymentSheetItemDetailDto['verifications']
>[number];

export interface IPaymentSheetItemRejectView {
  stage: string | null;
  rejectedByName: string;
  rejectedAt: string;
  reason: string;
}

export interface IPaymentSheetPaymentAdviceView {
  referenceNumber: string;
  pdfKey: string | null;
}

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
  paidFromAccount: IBankDetailsCellValue | null;
  paymentAdvice: IPaymentSheetPaymentAdviceView | null;
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
  rejectDetail: IPaymentSheetItemRejectView | null;
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
  createdByName: string | null;
  beneficiaryCount: number;
  verificationSummary: IPaymentSheetOverviewVerificationView | null;
  totalRequestedAmount: number;
  totalCurrentAmount: number;
  totalPaidAmount: number;
  pendingAmount: number;
  remarks: string | null;
}

export type TPaymentSheetTimelineTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'paid'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'updated'
  | 'removed';

export type TPaymentSheetTimelineDetailVariant =
  | 'default'
  | 'emphasis'
  | 'note'
  | 'paidFrom'
  | 'attachment';

export interface IPaymentSheetTimelineEventDetail {
  icon?: string;
  label: string;
  value?: string;
  bankDetails?: IBankDetailsCellValue | null;
  attachmentKeys?: string[];
  variant?: TPaymentSheetTimelineDetailVariant;
}

export interface IPaymentSheetTimelineEventView {
  id: string;
  occurredAt: string;
  title: string;
  performedBy: string;
  details: IPaymentSheetTimelineEventDetail[];
  icon: string;
  tone: TPaymentSheetTimelineTone;
}

export type TPaymentSheetStageLogView = NonNullable<
  IPaymentSheetDetailGetResponseDto['stageLogs']
>[number];

export type TPaymentSheetHistoryEntryView = NonNullable<
  IPaymentSheetDetailGetResponseDto['history']
>[number] & {
  remarks?: string | null;
};

export interface IPaymentSheetTimelineDrawerContext {
  sheetNumber: string;
  contextSubtitle: string;
}

export interface IPaymentSheetTimelineDrawerDataWorkflow
  extends IPaymentSheetTimelineDrawerContext {
  mode: EPaymentSheetTimelineMode.WORKFLOW;
  paymentSheetId: string;
  stageLogs?: TPaymentSheetStageLogView[];
}

export interface IPaymentSheetTimelineDrawerDataItemHistory
  extends IPaymentSheetTimelineDrawerContext {
  mode: EPaymentSheetTimelineMode.ITEM_HISTORY;
  itemId: string;
  history: TPaymentSheetHistoryEntryView[];
  paidFromAccount?: IBankDetailsCellValue | null;
  paymentAdvice?: IPaymentSheetPaymentAdviceView | null;
}

export type IPaymentSheetTimelineDrawerData =
  | IPaymentSheetTimelineDrawerDataWorkflow
  | IPaymentSheetTimelineDrawerDataItemHistory;
