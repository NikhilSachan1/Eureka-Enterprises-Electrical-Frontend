import { IPaymentSheetGetBaseResponseDto } from './payment-sheet.dto';

export interface IPaymentSheet extends IPaymentSheetGetBaseResponseDto {
  originalRawData: IPaymentSheetGetBaseResponseDto;
}
