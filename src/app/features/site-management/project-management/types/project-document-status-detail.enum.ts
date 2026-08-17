export enum EDocChainStage {
  PO = 'PO',
  JMC = 'JMC',
  REPORT = 'REPORT',
  INVOICE = 'INVOICE',
  BOOK_PAYMENT = 'BOOK_PAYMENT',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum EDocChainNodeState {
  DONE = 'DONE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  MISSING = 'MISSING',
  PARTIAL = 'PARTIAL',
}
