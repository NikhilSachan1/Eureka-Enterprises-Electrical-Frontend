export enum EFuelExpenseTransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum EFuelExpenseCategory {
  SETTLEMENT = 'settlement',
}

export enum EFuelLedgerView {
  EMPLOYEE = 'EMPLOYEE',
  VEHICLE = 'VEHICLE',
}

/** `tab` query param that opens the ledger on Vehicle Wise. Follows the ledger tab order. */
export const FUEL_LEDGER_VEHICLE_TAB_INDEX = '1';
