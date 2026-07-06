import { IPaymentSheetGetBaseResponseDto } from './payment-sheet.dto';

export interface IPaymentSheet extends IPaymentSheetGetBaseResponseDto {
  originalRawData: IPaymentSheetGetBaseResponseDto;
}

export interface IPaymentSheetWorkflowRow {
  status?: string;
  currentStage?: string | null;
}
