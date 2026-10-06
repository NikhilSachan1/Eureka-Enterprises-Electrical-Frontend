import { IWalletRechargeGetBaseResponseDto } from './petro-card-wallet.dto';

export interface IWalletRecharge
  extends Pick<
    IWalletRechargeGetBaseResponseDto,
    'id' | 'rechargeDate' | 'amount' | 'referenceNumber'
  > {
  /** True when recharge has payment instrument details (UTR / paid-from). */
  isPaymentRecorded: boolean;
  paymentModeLabel: string | null;
  paidFromBankName: string | null;
  originalRawData: IWalletRechargeGetBaseResponseDto;
}
