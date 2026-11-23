import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { ProjectService } from '../../services/project.service';
import { buildProjectRoster } from '../../utility/allocation-journey.util';
import { daysLabel, untilLabel } from '../../utility/allocation-drawer.util';
import { ALLOCATION_DRAWER_PAGE_SIZE } from '../../constants/site-allocation.constants';
import {
  IProjectAllocationRosterData,
  IProjectRoster,
} from '../../types/allocation-journey.interface';

/** Everyone who worked on one project, as a timeline marking who is still allocated. */
@Component({
  selector: 'app-project-allocation-roster',
  imports: [DatePipe],
  templateUrl: './project-allocation-roster.component.html',
  styleUrl: '../allocation-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectAllocationRosterComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(
    DRAWER_DATA
  ) as IProjectAllocationRosterData;
  private readonly projectService = inject(ProjectService);

  protected readonly roster = signal<IProjectRoster | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly daysLabel = daysLabel;
  protected readonly untilLabel = untilLabel;

  override onDrawerShow(): void {
    this.loadRoster();
  }

  protected loadRoster(): void {
    this.loading.set(true);
    this.failed.set(false);

    this.projectService
      .getSiteAllocationHistory({
        projectName: this.drawerData.siteId,
        page: 1,
        pageSize: ALLOCATION_DRAWER_PAGE_SIZE,
        sortField: 'allocatedAt',
        sortOrder: 'DESC',
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.roster.set(buildProjectRoster(response.records, new Date()));
        },
        error: error => {
          this.failed.set(true);
          this.logger.logUserAction(
            'Failed to load project allocations',
            error
          );
        },
      });
  }
}
