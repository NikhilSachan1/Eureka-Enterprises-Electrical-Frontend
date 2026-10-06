import { IWalletRechargeGetBaseResponseDto } from '../types/petro-card-wallet.dto';

/** Recharge is paid when instrument details exist; otherwise treat as pending. */
export function isWalletRechargePaymentRecorded(
  record: Pick<
    IWalletRechargeGetBaseResponseDto,
    'referenceNumber' | 'paidFromAccountId' | 'paidFromAccount' | 'paymentMode'
  >
): boolean {
  return Boolean(
    record.referenceNumber?.trim() ||
      record.paidFromAccountId ||
      record.paidFromAccount ||
      record.paymentMode?.trim()
  );
}
