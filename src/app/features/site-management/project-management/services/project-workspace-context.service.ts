import {
  ChangeDetectorRef,
  computed,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { IInputFieldsConfig } from '@shared/types';
import { toLocalCalendarDate } from '@shared/utility';
import { ProjectService } from './project.service';
import { IProjectOverviewGetResponseDto } from '../types/project.dto';

export interface ProjectDateBounds {
  minDate: Date;
  maxDate: Date;
}

@Injectable({ providedIn: 'root' })
export class ProjectWorkspaceContextService {
  private readonly projectService = inject(ProjectService);

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
  readonly projectDateBounds = computed((): ProjectDateBounds | null => {
    const site = this._projectOverview()?.site;
    return site?.startDate && site?.endDate
      ? resolveProjectDateBounds(site.startDate, site.endDate)
      : null;
  });

  setDocWorkspaceFilter(filter: Record<string, unknown> | null): void {
    this._docWorkspaceFilter.set(filter);
  }

  setSelectedProject(projectId: string | undefined): void {
    const current = this._docWorkspaceFilter();

    if (projectId) {
      if (current?.['projectName'] === projectId) {
        return;
      }
      this._docWorkspaceFilter.set({
        ...(current ?? {}),
        projectName: projectId,
      });
      return;
    }

    if (!current?.['projectName']) {
      return;
    }

    const rest = { ...current };
    delete rest['projectName'];
    this._docWorkspaceFilter.set(Object.keys(rest).length ? rest : null);
  }

  mergeWorkspaceFilter(filterData: Record<string, unknown>): void {
    this._docWorkspaceFilter.set({
      ...(this._docWorkspaceFilter() ?? {}),
      ...filterData,
    });
  }

  loadOverview(projectId: string): Observable<IProjectOverviewGetResponseDto> {
    this._projectOverviewLoading.set(true);
    this._projectOverview.set(null);

    return this.projectService.getProjectOverview(projectId).pipe(
      tap(response => this._projectOverview.set(response)),
      finalize(() => this._projectOverviewLoading.set(false))
    );
  }

  resetOverview(): void {
    this._projectOverview.set(null);
    this._projectOverviewLoading.set(false);
  }

  clear(): void {
    this._docWorkspaceFilter.set(null);
    this.resetOverview();
  }

  patchDateField(
    fieldConfigs: Record<string, IInputFieldsConfig>,
    fieldName: string,
    changeDetectorRef?: ChangeDetectorRef,
    site?: { startDate?: string; endDate?: string }
  ): void {
    const bounds =
      site?.startDate && site?.endDate
        ? resolveProjectDateBounds(site.startDate, site.endDate)
        : this.projectDateBounds();
    const base = fieldConfigs[fieldName];

    if (!bounds || !base?.dateConfig) {
      return;
    }

    fieldConfigs[fieldName] = {
      ...base,
      dateConfig: {
        ...base.dateConfig,
        minDate: bounds.minDate,
        maxDate: bounds.maxDate,
      },
    };

    if (changeDetectorRef) {
      queueMicrotask(() => changeDetectorRef.detectChanges());
    }
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

function resolveProjectDateBounds(
  startDate: string,
  endDate: string
): ProjectDateBounds | null {
  const minDate = toLocalCalendarDate(startDate);
  const siteEnd = toLocalCalendarDate(endDate);
  const today = toLocalCalendarDate(new Date());

  if (!minDate || !siteEnd || !today) {
    return null;
  }

  return {
    minDate,
    maxDate: siteEnd.getTime() < today.getTime() ? siteEnd : today,
  };
}
