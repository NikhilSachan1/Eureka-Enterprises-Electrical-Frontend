import { Injectable, signal } from '@angular/core';
import { TABLE_ROW_HIGHLIGHT_REQUEST_TTL_MS } from '@shared/constants/table-row-highlight.constants';

/**
 * One-time "show me this row" hand-off, e.g. from a notification to the list it opens.
 *
 * Call {@link request} just before navigating. The data table that shows a row with that id
 * lights it once and calls {@link clear}. The request lives in memory only, never in the URL
 * or history, so a refresh or a later visit does not light the row again.
 */
@Injectable({ providedIn: 'root' })
export class TableRowHighlightService {
  private readonly pending = signal<string | null>(null);
  private expiry?: ReturnType<typeof setTimeout>;

  /** Row id waiting to be highlighted, or null. */
  readonly pendingId = this.pending.asReadonly();

  request(rowId: string | null | undefined): void {
    clearTimeout(this.expiry);
    const id = rowId?.trim();
    if (!id) {
      this.pending.set(null);
      return;
    }
    this.pending.set(id);
    this.expiry = setTimeout(
      () => this.pending.set(null),
      TABLE_ROW_HIGHLIGHT_REQUEST_TTL_MS
    );
  }

  clear(): void {
    clearTimeout(this.expiry);
    this.pending.set(null);
  }
}
