import {
  ChangeDetectorRef,
  computed,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { finalize, Observable, of, shareReplay, Subscription, tap } from 'rxjs';
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

  private readonly _selectedProjectId = signal<string | undefined>(undefined);
  private readonly _appliedWorkspaceFilter = signal<Record<
    string,
    unknown
  > | null>(null);
  private readonly _projectOverview =
    signal<IProjectOverviewGetResponseDto | null>(null);
  private readonly _overviewProjectId = signal<string | undefined>(undefined);
  /** Set on Search only — stays visible when dropdown project changes. */
  private readonly _displayedProjectOverview =
    signal<IProjectOverviewGetResponseDto | null>(null);
  private readonly _projectOverviewLoading = signal(false);

  private inFlightId?: string;
  private inFlight$?: Observable<IProjectOverviewGetResponseDto>;
  private inFlightSub?: Subscription;

  readonly appliedWorkspaceFilter = this._appliedWorkspaceFilter.asReadonly();
  readonly projectOverview = this._projectOverview.asReadonly();
  readonly overviewProjectId = this._overviewProjectId.asReadonly();
  readonly projectOverviewLoading = this._projectOverviewLoading.asReadonly();
  readonly selectedProjectId = this._selectedProjectId.asReadonly();

  /** Timeline loads only when this project id changes (not on company/date search). */
  readonly timelineProjectId = computed(() =>
    extractWorkspaceProjectId(this._appliedWorkspaceFilter())
  );

  readonly displayedProjectOverview =
    this._displayedProjectOverview.asReadonly();

  readonly projectDateBounds = computed((): ProjectDateBounds | null => {
    const site = this._projectOverview()?.site;
    return site?.startDate && site?.endDate
      ? resolveProjectDateBounds(site.startDate, site.endDate)
      : null;
  });

  setSelectedProject(projectId: string | undefined): void {
    if (this._selectedProjectId() === projectId) {
      return;
    }
    this._selectedProjectId.set(projectId);
  }

  applyWorkspaceFilter(filterData: Record<string, unknown>): void {
    this._appliedWorkspaceFilter.set(filterData);

    const projectId =
      extractWorkspaceProjectId(filterData) ?? this._selectedProjectId();
    if (!projectId) {
      return;
    }

    const overview = this._projectOverview();
    if (overview && this._overviewProjectId() === projectId) {
      this._displayedProjectOverview.set(overview);
      return;
    }

    this.loadOverview(projectId).subscribe(response => {
      this._displayedProjectOverview.set(response);
    });
  }

  loadOverview(projectId: string): Observable<IProjectOverviewGetResponseDto> {
    const overview = this._projectOverview();
    if (overview && this._overviewProjectId() === projectId) {
      return of(overview);
    }

    if (this.inFlightId === projectId && this.inFlight$) {
      return this.inFlight$;
    }

    this.inFlightSub?.unsubscribe();
    this.inFlightId = projectId;
    this._projectOverviewLoading.set(true);
    this._projectOverview.set(null);
    this._overviewProjectId.set(undefined);

    this.inFlight$ = this.projectService.getProjectOverview(projectId).pipe(
      tap(response => {
        this._projectOverview.set(response);
        this._overviewProjectId.set(projectId);
      }),
      finalize(() => {
        this._projectOverviewLoading.set(false);
        if (this.inFlightId === projectId) {
          this.inFlightId = undefined;
          this.inFlight$ = undefined;
          this.inFlightSub = undefined;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.inFlightSub = this.inFlight$.subscribe();

    return this.inFlight$;
  }

  resetOverview(): void {
    this.inFlightSub?.unsubscribe();
    this.inFlightId = undefined;
    this.inFlight$ = undefined;
    this.inFlightSub = undefined;
    this._projectOverview.set(null);
    this._overviewProjectId.set(undefined);
    this._projectOverviewLoading.set(false);
  }

  clear(): void {
    this._selectedProjectId.set(undefined);
    this._appliedWorkspaceFilter.set(null);
    this._displayedProjectOverview.set(null);
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

export function extractWorkspaceProjectId(
  filter: Record<string, unknown> | null | undefined
): string | undefined {
  const raw = filter?.['projectName'];
  if (typeof raw === 'string' && raw) {
    return raw;
  }
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0]) {
    return raw[0];
  }
  return undefined;
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
