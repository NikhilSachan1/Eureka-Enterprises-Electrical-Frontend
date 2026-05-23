import { Injectable, signal } from '@angular/core';
import { IProjectOverviewGetResponseDto } from '../types/project.dto';
import { IProjectWorkspaceSearchFilterFormDto } from '../types/project.interface';

@Injectable()
export class ProjectWorkspaceContextService {
  private readonly filtersSignal = signal<IProjectWorkspaceSearchFilterFormDto>(
    {}
  );
  private readonly filterSubmitVersionSignal = signal(0);
  private readonly projectOverviewSignal =
    signal<IProjectOverviewGetResponseDto | null>(null);
  private readonly activeProjectIdSignal = signal<string | undefined>(
    undefined
  );

  readonly filters = this.filtersSignal.asReadonly();
  readonly filterSubmitVersion = this.filterSubmitVersionSignal.asReadonly();
  readonly projectOverview = this.projectOverviewSignal.asReadonly();
  readonly activeProjectId = this.activeProjectIdSignal.asReadonly();

  readonly selectedProjectId = signal<string | undefined>(undefined);

  setActiveProjectId(projectId: string | undefined): void {
    this.activeProjectIdSignal.set(projectId);
  }

  applyFilters(
    filters: IProjectWorkspaceSearchFilterFormDto,
    options?: { notifyTabs?: boolean }
  ): void {
    this.filtersSignal.set({ ...filters });
    this.selectedProjectId.set(filters.projectName);
    if (options?.notifyTabs !== false) {
      this.filterSubmitVersionSignal.update(version => version + 1);
    }
  }

  resetFilters(): void {
    this.filtersSignal.set({});
    this.selectedProjectId.set(undefined);
    this.activeProjectIdSignal.set(undefined);
    this.projectOverviewSignal.set(null);
    this.filterSubmitVersionSignal.update(version => version + 1);
  }

  setProjectOverview(overview: IProjectOverviewGetResponseDto | null): void {
    this.projectOverviewSignal.set(overview);
  }
}
