import { EPaymentSheetSourceType } from '../types/payment-sheet.enum';

/** How an employee line's payable splits between the due it settles and advance. */
export interface IPaymentSheetAdvanceBreakdown {
  /** Due when the line was added; negative means advance the employee already holds. */
  actualDue: number;
  payable: number;
  /** Part of the payable that clears the due. */
  settledDue: number;
  /** Part of the payable paid as fresh advance. */
  newAdvance: number;
  /** Due still open after this payment. */
  remainingDue: number;
  /** Advance the employee already held before this payment. */
  existingAdvance: number;
  /** Advance the employee will hold after this payment. */
  totalAdvance: number;
}

/** Where the employee stands once this line is paid. */
export interface IPaymentSheetBalanceAfter {
  kind: 'due' | 'settled' | 'advance';
  /** Due still open, or advance held; 0 when settled. */
  amount: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Only employee expense/fuel lines can carry advance; vendor and wallet lines cannot. */
export function isPaymentSheetEmployeeSource(
  sourceType: EPaymentSheetSourceType | string | null | undefined
): boolean {
  return (
    sourceType === EPaymentSheetSourceType.EXPENSE ||
    sourceType === EPaymentSheetSourceType.FUEL_EXPENSE
  );
}

export function getPaymentSheetAdvanceBreakdown(
  actualDue: number,
  payable: number
): IPaymentSheetAdvanceBreakdown {
  const due = Number(actualDue) || 0;
  const pay = Math.max(0, Number(payable) || 0);
  const openDue = Math.max(0, due);
  const settledDue = Math.min(pay, openDue);
  const newAdvance = round2(pay - settledDue);
  const existingAdvance = round2(Math.max(0, -due));

  return {
    actualDue: due,
    payable: pay,
    settledDue: round2(settledDue),
    newAdvance,
    remainingDue: round2(openDue - settledDue),
    existingAdvance,
    totalAdvance: round2(existingAdvance + newAdvance),
  };
}

export function getPaymentSheetBalanceAfter(
  breakdown: IPaymentSheetAdvanceBreakdown
): IPaymentSheetBalanceAfter {
  if (breakdown.remainingDue > 0) {
    return { kind: 'due', amount: breakdown.remainingDue };
  }

  if (breakdown.totalAdvance > 0) {
    return { kind: 'advance', amount: breakdown.totalAdvance };
  }

  return { kind: 'settled', amount: 0 };
}
