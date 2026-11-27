/** Kinds of leave ledger rows; mirrors the backend's LeaveLedgerEntryType. */
export enum ELeaveLedgerEntryType {
  ADVANCE_CREDIT = 'advance_credit',
  MONTHLY_ACCRUAL = 'monthly_accrual',
  HOLIDAY_WORK_CREDIT = 'holiday_work_credit',
  LEAVE_DEBIT = 'leave_debit',
  LEAVE_REVERSAL = 'leave_reversal',
  LWP_CONVERSION = 'lwp_conversion',
  LEGACY_OPENING = 'legacy_opening',
  LEGACY_CONSUMED = 'legacy_consumed',
  LEGACY_CORRECTION = 'legacy_correction',
}
