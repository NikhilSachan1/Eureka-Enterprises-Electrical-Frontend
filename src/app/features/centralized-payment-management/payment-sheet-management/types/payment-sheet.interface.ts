import { IPaymentSheetGetBaseResponseDto } from './payment-sheet.dto';

export interface IPaymentSheet extends IPaymentSheetGetBaseResponseDto {
  originalRawData: IPaymentSheetGetBaseResponseDto;
}

export interface IPaymentSheetWorkflowPermissions {
  canCreate: boolean;
  canReview: boolean;
  canAdminReview: boolean;
  canProcess: boolean;
}

export interface IPaymentSheetWorkflowRow {
  status?: string;
  currentStage?: string | null;
}
