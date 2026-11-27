import { EPrimeNGSeverity } from '@shared/types';

/** How one kind of ledger row reads in the passbook. */
export interface ILeaveLedgerEntryTypeView {
  label: string;
  severity: EPrimeNGSeverity;
  icon: string;
}

/** The employee picker above the ledger (only for those who may see anyone's ledger). */
export interface ILeaveLedgerEmployeeFormDto extends Record<string, unknown> {
  employeeName: string | null;
}

/** One month row of the "earned from attendance" table. */
export interface ILeaveLedgerMonthRow {
  month: string;
  label: string;
  workingDays: number;
  paidDays: number;
  absentOrUnpaidDays: number;
  earned: number;
  credited: number;
  inProgress: boolean;
}

export interface ILeaveSummaryCard {
  label: string;
  value: number;
  hint: string;
  icon: string;
  tone: 'credited' | 'used' | 'available';
}
