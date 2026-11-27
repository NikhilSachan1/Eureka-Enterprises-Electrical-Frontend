/** Filter bar of the leave ledger. */
export interface ILeaveLedgerSearchFilterFormDto
  extends Record<string, unknown> {
  employeeName?: string | null;
  financialYear?: string | null;
}

/** One statement line as the table shows it. */
export interface ILeaveLedgerTableRow extends Record<string, unknown> {
  id: string;
  date: string;
  particulars: string;
  particularsNote: string;
  icon: string;
  entryType: string;
  credit: number;
  debit: number;
  balance: number;
}

/** Title, note and icon of one statement line. */
export interface ILeaveLedgerParticulars {
  particulars: string;
  particularsNote: string;
  icon: string;
}
