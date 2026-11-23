import { IBankDetailsCellValue } from '../bank-details/bank-details.interface';

/** How a payment was made, shown by the shared payment receipt. Empty parts are skipped. */
export interface IPaymentReceipt {
  /** UTR, transaction id or other bank reference. */
  reference?: string | null;
  /** Label for `reference`. Defaults to "UTR". */
  referenceLabel?: string;
  /** Payment mode, already mapped to its display label (e.g. "UPI", "Cash"). */
  mode?: string | null;
  /** Account the money left from (or arrived in, with `paidFromLabel`). */
  paidFrom?: IBankDetailsCellValue | null;
  /** Label for `paidFrom`. Defaults to "Paid from". */
  paidFromLabel?: string;
  paidAt?: string | Date | null;
}
