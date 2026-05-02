export enum EDocType {
  PO = 'PO',
  JMC = 'JMC',
  REPORT = 'REPORT',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  PAYMENT_ADVICE = 'PAYMENT_ADVICE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  /** Release held GST to government / booking — amount is plain, no tax-on-tax. */
  GST_PAYMENT_RELEASE = 'GST_PAYMENT_RELEASE',
}
