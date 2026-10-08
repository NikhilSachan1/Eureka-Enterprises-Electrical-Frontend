import { signal } from '@angular/core';
import { catchError, finalize, Observable, of, Subscription } from 'rxjs';
import type { IOptionDropdown, IReferenceDropdownPage } from '@shared/types';

/** Page/search/append state for server-paginated dropdowns. */
export class ScrollableDropdownPages {
  readonly options = signal<IOptionDropdown[]>([]);
  readonly loading = signal(false);

  private page = 0;
  private totalRecords = 0;
  private searchTerm = '';
  private requestSub?: Subscription;
  private initialized = false;
  private lastRequestedPage = 0;

  constructor(
    private readonly loadFn: (params: {
      page: number;
      pageSize: number;
      search: string;
    }) => Observable<IReferenceDropdownPage>,
    private readonly pageSize: number
  ) {}

  ensureInitialLoad(): void {
    if (!this.initialized && !this.loading()) {
      this.resetAndLoad('');
    }
  }

  /** Instant empty + loading UI while debounced search is pending. */
  markSearching(): void {
    this.cancelRequest();
    this.loading.set(true);
    this.options.set([]);
    this.page = 0;
    this.lastRequestedPage = 0;
    this.totalRecords = 0;
  }

  search(term: string): void {
    const next = (term ?? '').trim();
    // markSearching() sets loading, so a repeat of the same term still refetches.
    if (this.initialized && next === this.searchTerm && !this.loading()) {
      return;
    }
    this.resetAndLoad(next);
  }

  loadMoreFromScroll(): void {
    if (
      !this.initialized ||
      this.loading() ||
      this.options().length >= this.totalRecords ||
      this.options().length === 0
    ) {
      return;
    }
    const nextPage = this.page + 1;
    if (nextPage > this.lastRequestedPage) {
      this.fetchPage(nextPage, true);
    }
  }

  destroy(): void {
    this.cancelRequest();
  }

  private resetAndLoad(search: string): void {
    this.cancelRequest();
    this.page = 0;
    this.lastRequestedPage = 0;
    this.totalRecords = 0;
    this.searchTerm = search;
    this.options.set([]);
    this.initialized = true;
    this.fetchPage(1, false);
  }

  private fetchPage(page: number, append: boolean): void {
    this.lastRequestedPage = page;
    this.loading.set(true);

    this.requestSub = this.loadFn({
      page,
      pageSize: this.pageSize,
      search: this.searchTerm,
    })
      .pipe(
        catchError(() =>
          of<IReferenceDropdownPage>({ records: [], totalRecords: 0 })
        ),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe(({ records = [], totalRecords = 0 }) => {
        this.page = page;
        this.totalRecords = totalRecords;

        if (!append) {
          this.options.set(records);
          if (records.length < this.pageSize) {
            this.totalRecords = records.length;
          }
          return;
        }

        const existing = new Set(this.options().map(item => item.value));
        const unique = records.filter(item => !existing.has(item.value));
        if (unique.length === 0) {
          this.totalRecords = this.options().length;
          return;
        }

        this.options.update(current => [...current, ...unique]);
        if (records.length < this.pageSize) {
          this.totalRecords = this.options().length;
        }
      });
  }

  private cancelRequest(): void {
    this.requestSub?.unsubscribe();
    this.requestSub = undefined;
  }
}
