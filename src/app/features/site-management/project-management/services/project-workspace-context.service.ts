import { computed, Injectable, signal } from '@angular/core';
import { IProjectOverviewGetResponseDto } from '../types/project.dto';

@Injectable({ providedIn: 'root' })
export class ProjectWorkspaceContextService {
  private readonly _docWorkspaceFilter = signal<Record<string, unknown> | null>(
    null
  );
  private readonly _projectOverview =
    signal<IProjectOverviewGetResponseDto | null>(null);
  private readonly _projectOverviewLoading = signal(false);

  readonly docWorkspaceFilter = this._docWorkspaceFilter.asReadonly();
  readonly projectOverview = this._projectOverview.asReadonly();
  readonly projectOverviewLoading = this._projectOverviewLoading.asReadonly();
  readonly selectedProjectId = computed(() =>
    extractWorkspaceProjectId(this._docWorkspaceFilter())
  );

  setDocWorkspaceFilter(filter: Record<string, unknown> | null): void {
    this._docWorkspaceFilter.set(filter);
  }

  setProjectOverview(overview: IProjectOverviewGetResponseDto | null): void {
    this._projectOverview.set(overview);
  }

  setProjectOverviewLoading(loading: boolean): void {
    this._projectOverviewLoading.set(loading);
  }

  clear(): void {
    this._docWorkspaceFilter.set(null);
    this._projectOverview.set(null);
    this._projectOverviewLoading.set(false);
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
