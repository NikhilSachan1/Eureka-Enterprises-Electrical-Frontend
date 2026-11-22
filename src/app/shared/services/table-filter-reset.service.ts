import { Injectable } from '@angular/core';
import { Table } from 'primeng/table';

/**
 * Lets a data table clear the search filter that drives it, without the page wiring
 * anything: the search filter registers its own reset for the PrimeNG table it filters,
 * and the table's "Clear filters" empty state calls it. The reset therefore also clears
 * the filter form, chips and URL, exactly like the filter's own Reset button.
 */
@Injectable({ providedIn: 'root' })
export class TableFilterResetService {
  private readonly resets = new Map<Table, () => void>();

  register(table: Table, reset: () => void): void {
    this.resets.set(table, reset);
  }

  unregister(table: Table, reset: () => void): void {
    if (this.resets.get(table) === reset) {
      this.resets.delete(table);
    }
  }

  canReset(table: Table | undefined): boolean {
    return !!table && this.resets.has(table);
  }

  /** Returns false when no search filter drives this table. */
  reset(table: Table | undefined): boolean {
    const reset = table ? this.resets.get(table) : undefined;
    reset?.();
    return !!reset;
  }
}
