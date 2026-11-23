import { IPaymentReceipt } from '@shared/types';
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
  paymentReceipt: IPaymentReceipt;
  originalRawData: IWalletRechargeGetBaseResponseDto;
}
