import { Injectable, signal } from '@angular/core';

/**
 * Coordinates a one-shot URL filter restore between SearchFilter and DataTable.
 * Session ids ignore a previous page's destroy callback after navigation.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchFilterUrlRestoreService {
  private readonly pending = signal(false);
  private sessionId = 0;
  private activeSession = 0;

  readonly hasPendingRestore = this.pending.asReadonly();

  beginRestore(): number {
    const id = ++this.sessionId;
    this.activeSession = id;
    this.pending.set(true);
    return id;
  }

  finishRestore(sessionId?: number): void {
    if (sessionId != null && sessionId !== this.activeSession) {
      return;
    }
    this.pending.set(false);
  }
}
