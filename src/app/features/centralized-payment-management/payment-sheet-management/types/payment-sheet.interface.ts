import { IPaymentSheetGetBaseResponseDto } from './payment-sheet.dto';

export interface IPaymentSheet extends IPaymentSheetGetBaseResponseDto {
  statusLabel?: string;
  originalRawData: IPaymentSheetGetBaseResponseDto;
}

export interface IPaymentSheetWorkflowRow {
  status?: string;
  currentStage?: string | null;
}
