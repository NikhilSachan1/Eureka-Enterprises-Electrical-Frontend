import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Observable } from 'rxjs';
import { AppPermissionService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { AppConfigurationService, TableService } from '@shared/services';
import { EButtonActionType, ITableActionClickEvent } from '@shared/types';
import { getMappedValueFromArrayOfObjects, toTitleCase } from '@shared/utility';
import { SITE_ALLOCATION_EMPLOYEE_FILTER_FIELD_CONFIG } from '../../config';
import {
  ALLOCATION_SUMMARY_FILTER_HEADER_CONFIG,
  EMPLOYEE_WISE_ALLOCATION_TABLE_ENHANCED_CONFIG,
} from '../../config/table/get-allocation-summary.config';
import { buildWorkspaceEmployeeFilterFieldConfig } from '../../utility/project-allocated-employee-filter.util';
import { ProjectService } from '../../services/project.service';
import {
  IWorkspaceSummaryGetFormDto,
  IEmployeeAllocationSummaryDto,
  IEmployeeAllocationSummaryGetResponseDto,
} from '../../types/project.dto';
import { IEmployeeAllocationSummaryRow } from '../../types/site-allocation.interface';
import { WorkspaceSummaryTableBase } from '../workspace-summary-table.base';
import { EmployeeAllocationJourneyComponent } from '../employee-allocation-journey/employee-allocation-journey.component';

/** One row per employee allocated under the workspace filters, summed on the server. */
@Component({
  selector: 'app-get-employee-wise-allocation',
  imports: [DataTableComponent, PageHeaderComponent, InputFieldComponent],
  templateUrl: './get-employee-wise-allocation.component.html',
  styleUrl: '../../../../../shared/styles/summary-cell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetEmployeeWiseAllocationComponent extends WorkspaceSummaryTableBase<
  IEmployeeAllocationSummaryDto,
  IEmployeeAllocationSummaryRow
> {
  private readonly projectService = inject(ProjectService);
  private readonly dataTableService = inject(TableService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly headerConfig = ALLOCATION_SUMMARY_FILTER_HEADER_CONFIG;
  /** Same permission and field as the Entries tab's employee filter. */
  protected readonly showEmployeeFilter = computed(() =>
    this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.DSR.SEARCH_FILTER_EMPLOYEE_NAME
    )
  );
  protected readonly employeeFilterFieldConfig = computed(() =>
    buildWorkspaceEmployeeFilterFieldConfig(
      SITE_ALLOCATION_EMPLOYEE_FILTER_FIELD_CONFIG,
      this.workspaceContext.selectedProjectId(),
      this.workspaceContext.projectOverview(),
      this.workspaceContext.overviewSiteId()
    )
  );
  protected readonly selectedEmployeeId = signal<string | null>(null);

  protected readonly summaryName = 'employee wise allocation';
  protected readonly table = this.dataTableService.createTable(
    EMPLOYEE_WISE_ALLOCATION_TABLE_ENHANCED_CONFIG
  );

  protected fetchPage(
    params: IWorkspaceSummaryGetFormDto
  ): Observable<IEmployeeAllocationSummaryGetResponseDto> {
    return this.projectService.getEmployeeAllocationSummary(params);
  }

  protected override extraParams(): Partial<IWorkspaceSummaryGetFormDto> {
    const employeeName = this.selectedEmployeeId();
    return employeeName ? { employeeName } : {};
  }

  protected onEmployeeFilterChange(value: unknown): void {
    this.selectedEmployeeId.set(
      typeof value === 'string' && value.length > 0 ? value : null
    );
    this.reload();
  }

  protected toRow(
    record: IEmployeeAllocationSummaryDto
  ): IEmployeeAllocationSummaryRow {
    return {
      id: record.userId,
      userId: record.userId,
      user: {
        fullName: `${record.firstName} ${record.lastName}`.trim(),
        employeeId: record.employeeId,
      },
      statusLabel: record.status
        ? getMappedValueFromArrayOfObjects(
            this.appConfigurationService.employeeStatus(),
            record.status
          )
        : '—',
      projectCount: record.projectCount,
      allocatedDays: record.allocatedDays,
      freeDays: record.freeDays ?? null,
      onSitePercent: onSiteShare(record.allocatedDays, record.freeDays),
      freeFrom: record.freeFrom ?? null,
      freeTo: record.freeTo ?? null,
    };
  }

  protected onRowActionClick(event: ITableActionClickEvent): void {
    const [row] =
      event.selectedRows as unknown as IEmployeeAllocationSummaryRow[];
    if (event.actionType !== EButtonActionType.EVENT_HISTORY || !row) {
      return;
    }

    this.drawerService.showDrawer(EmployeeAllocationJourneyComponent, {
      header: 'Allocation journey',
      subtitle: this.periodSubtitle(
        'Projects this employee worked on, newest first'
      ),
      componentData: {
        userId: row.userId,
        fullName: toTitleCase(row.user.fullName),
        employeeId: row.user.employeeId,
        freeFrom: row.freeFrom,
        freeTo: row.freeTo,
        period: this.workspacePeriod(),
      },
    });
  }
}

/** On-site days as a share of on-site + free days; null when either is unknown or both are 0. */
function onSiteShare(
  allocatedDays: number,
  freeDays: number | null | undefined
): number | null {
  if (freeDays === null || freeDays === undefined) {
    return null;
  }
  const total = allocatedDays + freeDays;
  return total > 0 ? Math.round((allocatedDays / total) * 100) : null;
}
