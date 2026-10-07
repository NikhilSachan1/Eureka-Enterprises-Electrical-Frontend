import { IWalletRechargeGetBaseResponseDto } from '../types/petro-card-wallet.dto';

export type IWalletRechargeStatus = 'PENDING' | 'PAID';

export function getWalletRechargeStatus(
  record: Pick<IWalletRechargeGetBaseResponseDto, 'status'> &
    Partial<
      Pick<
        IWalletRechargeGetBaseResponseDto,
        'referenceNumber' | 'paidFromAccountId' | 'paidFromAccount' | 'paymentMode'
      >
    >
): IWalletRechargeStatus {
  if (record.status === 'PAID' || record.status === 'PENDING') {
    return record.status;
  }

  const hasPaymentDetails = Boolean(
    record.referenceNumber?.trim() ||
      record.paidFromAccountId ||
      record.paidFromAccount ||
      record.paymentMode?.trim()
  );

  return hasPaymentDetails ? 'PAID' : 'PENDING';
}

export function isWalletRechargePaid(
  record: Parameters<typeof getWalletRechargeStatus>[0]
): boolean {
  return getWalletRechargeStatus(record) === 'PAID';
}

/** Prefer API `editable`; fall back to unpaid (PENDING) only. */
export function isWalletRechargeEditable(
  record: Pick<IWalletRechargeGetBaseResponseDto, 'editable' | 'status'> &
    Parameters<typeof getWalletRechargeStatus>[0]
): boolean {
  if (typeof record.editable === 'boolean') {
    return record.editable;
  }

  return !isWalletRechargePaid(record);
}

/** @deprecated Use {@link isWalletRechargePaid}. */
export function isWalletRechargePaymentRecorded(
  record: Parameters<typeof getWalletRechargeStatus>[0]
): boolean {
  return isWalletRechargePaid(record);
}
