import { IBankDetailsCellValue } from '@shared/types';
import { IWalletRechargeGetBaseResponseDto } from './petro-card-wallet.dto';
import { IWalletRechargeStatus } from '../utils/wallet-recharge-payment.util';

export interface IWalletRecharge
  extends Pick<
    IWalletRechargeGetBaseResponseDto,
    'id' | 'rechargeDate' | 'amount' | 'referenceNumber'
  > {
  status: IWalletRechargeStatus;
  statusLabel: 'Pending' | 'Paid';
  editable: boolean;
  isPaymentRecorded: boolean;
  paymentModeLabel: string | null;
  paidFromBankName: string | null;
  paidFromAccount: IBankDetailsCellValue | null;
  originalRawData: IWalletRechargeGetBaseResponseDto;
}
