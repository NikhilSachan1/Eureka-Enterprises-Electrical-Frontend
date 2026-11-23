import { Injectable, signal } from '@angular/core';
import { IPageEmptyStateAction } from '@shared/types';

/**
 * Carries the page's main action (e.g. "Add Asset") from the page header to the data
 * table, so a table with no records can offer it without the page wiring anything.
 * The page header sets it from the button marked `showInEmptyState` and clears it on
 * destroy; clicking it runs the header button's own click, permission included.
 */
@Injectable({ providedIn: 'root' })
export class PageEmptyStateActionService {
  private readonly current = signal<IPageEmptyStateAction | null>(null);
  readonly action = this.current.asReadonly();

  set(action: IPageEmptyStateAction): void {
    this.current.set(action);
  }

  clear(action: IPageEmptyStateAction): void {
    if (this.current() === action) {
      this.current.set(null);
    }
  }
}
