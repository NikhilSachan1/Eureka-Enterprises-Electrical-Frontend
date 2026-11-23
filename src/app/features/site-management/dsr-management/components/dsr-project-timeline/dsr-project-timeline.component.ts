import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { daysLabel } from '@features/site-management/project-management/utility/allocation-drawer.util';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { DSR_TIMELINE_PAGE_SIZE } from '../../constants/dsr-summary.constants';
import { DsrService } from '../../services/dsr.service';
import type {
  IDsrProjectTimeline,
  IDsrProjectTimelineData,
} from '../../types/dsr-summary.interface';
import { EDsrTimelineEntryKind } from '../../types/dsr-summary.types';
import { buildDsrProjectTimeline } from '../../utility/dsr-timeline.util';
import { APP_CONFIG } from '@core/config';

/**
 * One project's DSRs as a timeline: each day with a report, and each run of days someone was on
 * site with no report. Counts match the "Project wise" table.
 */
@Component({
  selector: 'app-dsr-project-timeline',
  imports: [DatePipe],
  templateUrl: './dsr-project-timeline.component.html',
  styleUrls: [
    '../../../../../shared/styles/timeline-drawer.scss',
    './dsr-project-timeline.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsrProjectTimelineComponent extends DrawerDetailBase {
  protected readonly DATE_FORMATS = APP_CONFIG.DATE_FORMATS;
  protected readonly drawerData = inject(
    DRAWER_DATA
  ) as IDsrProjectTimelineData;
  private readonly dsrService = inject(DsrService);
  private readonly projectService = inject(ProjectService);

  protected readonly timeline = signal<IDsrProjectTimeline | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly daysLabel = daysLabel;
  protected readonly EDsrTimelineEntryKind = EDsrTimelineEntryKind;

  override onDrawerShow(): void {
    this.loadTimeline();
  }

  protected loadTimeline(): void {
    this.loading.set(true);
    this.failed.set(false);

    const { siteId, periodFrom, periodTo, userId } = this.drawerData;
    // Only the ends that are set: an open end stays open (not a single day).
    const dateRange = periodFrom || periodTo ? [periodFrom, periodTo] : null;

    forkJoin({
      reports: this.dsrService.getDSRList({
        projectName: siteId,
        dateRange,
        page: 1,
        pageSize: DSR_TIMELINE_PAGE_SIZE,
        sortField: 'reportDate',
        sortOrder: 'DESC',
      }),
      allocations: this.projectService.getSiteAllocationHistory({
        projectName: siteId,
        ...(userId ? { employeeName: userId } : {}),
        page: 1,
        pageSize: DSR_TIMELINE_PAGE_SIZE,
        sortField: 'allocatedAt',
        sortOrder: 'DESC',
      }),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ reports, allocations }) => {
          this.timeline.set(
            buildDsrProjectTimeline(
              reports.records,
              allocations.records,
              new Date(),
              { from: periodFrom, to: periodTo }
            )
          );
        },
        error: error => {
          this.failed.set(true);
          this.logger.logUserAction('Failed to load DSR timeline', error);
        },
      });
  }
}
