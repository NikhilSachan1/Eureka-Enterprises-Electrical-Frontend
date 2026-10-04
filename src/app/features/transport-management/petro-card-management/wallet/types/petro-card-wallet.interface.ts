import { IWalletRechargeGetBaseResponseDto } from './petro-card-wallet.dto';

export interface IWalletRecharge
  extends Pick<
    IWalletRechargeGetBaseResponseDto,
    | 'id'
    | 'rechargeDate'
    | 'amount'
    | 'referenceNumber'
    | 'paymentMode'
  > {
  originalRawData: IWalletRechargeGetBaseResponseDto;
}
