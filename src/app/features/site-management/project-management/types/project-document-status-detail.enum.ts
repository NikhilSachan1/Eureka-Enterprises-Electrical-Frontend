export enum EDocChainStage {
  PO = 'PO',
  JMC = 'JMC',
  REPORT = 'REPORT',
  INVOICE = 'INVOICE',
  BOOK_PAYMENT = 'BOOK_PAYMENT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  /** Invoice GST: portal verification + settlement of held GST. */
  GST = 'GST',
  /** Invoice TDS: challan (vendor) + 26Q / 26AS verification. */
  TDS = 'TDS',
  /** Advance payment raised on the PO before any invoice. */
  ADVANCE = 'ADVANCE',
}

export enum EDocChainNodeState {
  DONE = 'DONE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  MISSING = 'MISSING',
  PARTIAL = 'PARTIAL',
}
