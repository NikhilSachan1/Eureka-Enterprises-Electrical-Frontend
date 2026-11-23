/** Help text under "Payable Amount" in the edit popup, when the amount cannot be raised. */
export const PAYMENT_SHEET_EDIT_AMOUNT_HINT = {
  /** HR / Admin review: decrease only. */
  REVIEW:
    'You can lower the amount here. To pay more, return the sheet to the Operation Manager.',
  /** Vendor and wallet lines: capped at what is due. */
  CAPPED: 'You can lower the amount here, but not above what is due.',
} as const;

/** Mode shown on a paid line that has neither a source account nor a UTR. */
export const PAYMENT_SHEET_CASH_MODE_LABEL = 'Cash';
