/**
 * Tracks which data table opened the current bulk-action confirmation, so its
 * selection can be cleared once the action succeeds.
 *
 * Kept apart from DataTableComponent on purpose: ConfirmationDialogService is
 * loaded at startup, and importing the component from there would pull the
 * table and its PrimeNG dependencies into the initial bundle.
 */
interface IBulkSelectionTable {
  clearSelection(): void;
}

let activeBulkTable: IBulkSelectionTable | null = null;

/** Called by a data table when one of its bulk actions is clicked. */
export function registerActiveBulkTable(table: IBulkSelectionTable): void {
  activeBulkTable = table;
}

/** Called after bulk confirmation onSuccess — clears the table that opened the dialog. */
export function clearActiveBulkTableSelection(): void {
  activeBulkTable?.clearSelection();
  activeBulkTable = null;
}
