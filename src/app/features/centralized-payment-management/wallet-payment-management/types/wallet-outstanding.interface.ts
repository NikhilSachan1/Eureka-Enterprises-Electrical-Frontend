import { IWalletOutstandingGetBaseResponseDto } from './wallet-outstanding.dto';

export interface IWalletOutstanding
  extends IWalletOutstandingGetBaseResponseDto {
  pendingAmount: number;
  transactionType?: 'credit' | 'debit';
  originalRawData: IWalletOutstandingGetBaseResponseDto;
}
