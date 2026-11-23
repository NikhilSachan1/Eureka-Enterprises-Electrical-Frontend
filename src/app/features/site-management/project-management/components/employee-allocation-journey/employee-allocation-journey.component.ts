import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AvatarService } from '@shared/services';
import { ProjectService } from '../../services/project.service';
import { buildEmployeeJourney } from '../../utility/allocation-journey.util';
import {
  daysLabel,
  initialsOf,
  untilLabel,
} from '../../utility/allocation-drawer.util';
import { ALLOCATION_DRAWER_PAGE_SIZE } from '../../constants/site-allocation.constants';
import {
  IEmployeeAllocationJourneyData,
  IEmployeeJourney,
} from '../../types/allocation-journey.interface';
import { EJourneyEntryKind } from '../../types/allocation-journey.types';
import { APP_CONFIG } from '@core/config';

/**
 * One employee's movement across projects, newest first, with the free days between allocations.
 * Covers every project the viewer can read, not just the workspace's project.
 */
@Component({
  selector: 'app-employee-allocation-journey',
  imports: [DatePipe],
  templateUrl: './employee-allocation-journey.component.html',
  styleUrl: '../allocation-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeAllocationJourneyComponent extends DrawerDetailBase {
  protected readonly DATE_FORMATS = APP_CONFIG.DATE_FORMATS;
  protected readonly drawerData = inject(
    DRAWER_DATA
  ) as IEmployeeAllocationJourneyData;
  private readonly projectService = inject(ProjectService);
  private readonly avatarService = inject(AvatarService);

  protected readonly journey = signal<IEmployeeJourney | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly initials = initialsOf(this.drawerData.fullName);
  protected readonly avatarColor = `#${this.avatarService.getConsistentColor(this.drawerData.fullName)}`;
  protected readonly currentLabel = computed(() => {
    const projects = this.journey()?.currentProjects ?? [];
    return projects.length ? projects.join(', ') : 'Free';
  });

  protected readonly daysLabel = daysLabel;
  protected readonly EJourneyEntryKind = EJourneyEntryKind;
  protected readonly untilLabel = untilLabel;

  override onDrawerShow(): void {
    this.loadJourney();
  }

  protected loadJourney(): void {
    this.loading.set(true);
    this.failed.set(false);

    this.projectService
      .getSiteAllocationHistory({
        employeeName: this.drawerData.userId,
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
          this.journey.set(
            buildEmployeeJourney(response.records, new Date(), {
              from: this.drawerData.freeFrom,
              to: this.drawerData.freeTo,
            })
          );
        },
        error: error => {
          this.failed.set(true);
          this.logger.logUserAction('Failed to load allocation journey', error);
        },
      });
  }
}
