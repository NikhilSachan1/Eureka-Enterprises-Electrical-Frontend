/** Which ledger: contractor = SALE invoices, vendor = PURCHASE invoices (API `partyType`). */
export enum EInvoiceLedgerSide {
  CONTRACTOR = 'SALE',
  VENDOR = 'PURCHASE',
}

/** Indian FY quarters: Q1 = Apr–Jun … Q4 = Jan–Mar. */
export enum EInvoiceLedgerQuarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

/** Invoice payment after advances: nothing left, something received, nothing received. */
export enum EInvoiceLedgerPaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  UNPAID = 'UNPAID',
}

/** Age of an outstanding invoice, counted from its invoice date. */
export enum EInvoiceLedgerAgeingBucket {
  D0_30 = 'D0_30',
  D31_60 = 'D31_60',
  D61_90 = 'D61_90',
  D90_PLUS = 'D90_PLUS',
  UNDATED = 'UNDATED',
}
