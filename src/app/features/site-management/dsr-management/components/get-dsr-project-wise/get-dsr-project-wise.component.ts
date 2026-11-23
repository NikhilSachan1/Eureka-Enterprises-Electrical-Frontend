import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { AppPermissionService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { AuthService } from '@features/auth-management/services/auth.service';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { WorkspaceSummaryTableBase } from '@features/site-management/project-management/components/workspace-summary-table.base';
import type { IWorkspaceSummaryGetFormDto } from '@features/site-management/project-management/types/project.dto';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { AppConfigurationService, TableService } from '@shared/services';
import { EButtonActionType, ITableActionClickEvent } from '@shared/types';
import {
  getMappedValueFromArrayOfObjects,
  parseCalendarDay,
  toDayNumber,
} from '@shared/utility';
import { DSR_PROJECT_WISE_TABLE_ENHANCED_CONFIG } from '../../config/table/get-dsr-project-summary.config';
import { DSR_STALE_AFTER_DAYS } from '../../constants/dsr-summary.constants';
import { DsrService } from '../../services/dsr.service';
import type {
  IDsrProjectSummaryDto,
  IDsrProjectSummaryGetResponseDto,
} from '../../types/dsr.dto';
import type { IDsrProjectSummaryRow } from '../../types/dsr-summary.interface';
import { DsrProjectTimelineComponent } from '../dsr-project-timeline/dsr-project-timeline.component';
import { APP_CONFIG } from '@core/config';

/** How well each project reports its DSRs under the workspace filters, summed on the server. */
@Component({
  selector: 'app-get-dsr-project-wise',
  imports: [DataTableComponent, DocWorkspaceContextComponent, DatePipe],
  templateUrl: './get-dsr-project-wise.component.html',
  styleUrls: [
    '../../../../../shared/styles/summary-cell.scss',
    './get-dsr-project-wise.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrProjectWiseComponent extends WorkspaceSummaryTableBase<
  IDsrProjectSummaryDto,
  IDsrProjectSummaryRow
> {
  protected readonly DATE_FORMATS = APP_CONFIG.DATE_FORMATS;
  private readonly dsrService = inject(DsrService);
  private readonly dataTableService = inject(TableService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly authService = inject(AuthService);

  protected readonly summaryName = 'DSR project summary';
  protected readonly table = this.dataTableService.createTable(
    DSR_PROJECT_WISE_TABLE_ENHANCED_CONFIG
  );

  protected fetchPage(
    params: IWorkspaceSummaryGetFormDto
  ): Observable<IDsrProjectSummaryGetResponseDto> {
    const {
      projectName,
      dateRange,
      search,
      sortField,
      sortOrder,
      pageSize,
      page,
    } = params;
    return this.dsrService.getDsrProjectSummary({
      projectName,
      dateRange,
      search,
      sortField,
      sortOrder,
      pageSize,
      page,
    });
  }

  protected toRow(record: IDsrProjectSummaryDto): IDsrProjectSummaryRow {
    const lastReportDate = parseCalendarDay(record.lastReportDate);
    const daysSinceLastReport = lastReportDate
      ? toDayNumber(new Date()) - toDayNumber(lastReportDate)
      : null;

    return {
      id: record.siteId,
      siteId: record.siteId,
      docWorkspaceContext: {
        projectName: record.name,
        siteLocationSubtitle: [record.city, record.state]
          .map(part => part?.trim())
          .filter(Boolean)
          .join(', '),
      },
      statusLabel: record.status
        ? getMappedValueFromArrayOfObjects(
            this.appConfigurationService.projectStatus(),
            record.status
          )
        : '—',
      expectedDays: record.expectedDays,
      reportedDays: record.reportedDays,
      missingDays: record.missingDays,
      reportCount: record.reportCount,
      reporters: record.reporters,
      reportedPercent:
        record.expectedDays > 0
          ? Math.round((record.reportedDays / record.expectedDays) * 100)
          : null,
      lastReportDate,
      daysSinceLastReport,
      isStale:
        record.missingDays > 0 &&
        (daysSinceLastReport === null ||
          daysSinceLastReport > DSR_STALE_AFTER_DAYS),
    };
  }

  protected onRowActionClick(event: ITableActionClickEvent): void {
    const [row] = event.selectedRows as unknown as IDsrProjectSummaryRow[];
    if (event.actionType !== EButtonActionType.EVENT_HISTORY || !row) {
      return;
    }

    const [from, to] = this.workspaceContext.filters().dateRange ?? [];
    // Roles that may only see their own DSRs: count only their own allocations too.
    const ownOnly = !this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.DSR.SEARCH_FILTER_EMPLOYEE_NAME
    );

    this.drawerService.showDrawer(DsrProjectTimelineComponent, {
      header: 'DSR timeline',
      subtitle: 'Days with a DSR and days missed, newest first',
      componentData: {
        siteId: row.siteId,
        projectName: row.docWorkspaceContext.projectName,
        projectLocation: row.docWorkspaceContext.siteLocationSubtitle ?? '',
        periodFrom: from ? new Date(from) : null,
        periodTo: to ? new Date(to) : null,
        userId: ownOnly
          ? (this.authService.getCurrentUser()?.userId ?? null)
          : null,
      },
    });
  }
}
