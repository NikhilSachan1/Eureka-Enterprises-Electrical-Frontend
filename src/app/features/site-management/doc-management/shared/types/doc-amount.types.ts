/** Colour of one doc-amount line. Values double as the SCSS modifier (`doc-amount__value--paid`). */
export enum EDocAmountTone {
  TAXABLE = 'taxable',
  DEDUCTION = 'deduction',
  GST = 'gst',
  /** Still to happen: to be booked, remaining. Same amber as GST. */
  PENDING = 'pending',
  TOTAL = 'total',
  INVOICED = 'invoiced',
  BOOKED = 'booked',
  PAID = 'paid',
  NEUTRAL = 'neutral',
  /** Empty value placeholder; set by the component, not by callers. */
  MUTED = 'muted',
}
