import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectWorkspaceContextService {
  private readonly _docWorkspaceFilter = signal<Record<string, unknown> | null>(
    null
  );

  readonly docWorkspaceFilter = this._docWorkspaceFilter.asReadonly();
  readonly selectedProjectId = computed(() =>
    extractWorkspaceProjectId(this._docWorkspaceFilter())
  );

  setDocWorkspaceFilter(filter: Record<string, unknown> | null): void {
    this._docWorkspaceFilter.set(filter);
  }

  clear(): void {
    this._docWorkspaceFilter.set(null);
  }
}

function extractWorkspaceProjectId(
  filter: Record<string, unknown> | null
): string | undefined {
  const raw = filter?.['projectName'] as string | string[] | undefined;

  if (!raw) {
    return undefined;
  }

  return Array.isArray(raw) ? raw[0] : raw;
}
