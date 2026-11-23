export enum EPaymentReceiptVariant {
  /** Labelled rows with the account as a compact bank card (tables, detail drawers). */
  CARD = 'card',
  /** Small one-line facts, e.g. "UTR · 1234" (timelines and other tight spots). */
  INLINE = 'inline',
}
