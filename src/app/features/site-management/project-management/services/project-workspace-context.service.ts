import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectWorkspaceContextService {
  private readonly _docWorkspaceFilter = signal<Record<string, unknown> | null>(
    null
  );

  readonly docWorkspaceFilter = this._docWorkspaceFilter.asReadonly();

  setDocWorkspaceFilter(filter: Record<string, unknown> | null): void {
    this._docWorkspaceFilter.set(filter);
  }

  clear(): void {
    this._docWorkspaceFilter.set(null);
  }
}
