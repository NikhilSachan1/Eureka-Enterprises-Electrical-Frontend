import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { AppConfigurationService, TableService } from '@shared/services';
import { EButtonActionType, ITableActionClickEvent } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { PROJECT_WISE_ALLOCATION_TABLE_ENHANCED_CONFIG } from '../../config/table/get-allocation-summary.config';
import { ProjectService } from '../../services/project.service';
import {
  IAllocationSummaryGetFormDto,
  IProjectAllocationSummaryDto,
  IProjectAllocationSummaryGetResponseDto,
} from '../../types/project.dto';
import { IProjectAllocationSummaryRow } from '../../types/site-allocation.interface';
import { AllocationSummaryTableBase } from '../allocation-summary-table.base';
import { ProjectAllocationRosterComponent } from '../project-allocation-roster/project-allocation-roster.component';

/** One row per project with allocations under the workspace filters, summed on the server. */
@Component({
  selector: 'app-get-project-wise-allocation',
  imports: [DataTableComponent, DocWorkspaceContextComponent],
  templateUrl: './get-project-wise-allocation.component.html',
  styleUrl: '../allocation-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectWiseAllocationComponent extends AllocationSummaryTableBase<
  IProjectAllocationSummaryDto,
  IProjectAllocationSummaryRow
> {
  private readonly projectService = inject(ProjectService);
  private readonly dataTableService = inject(TableService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly summaryName = 'project wise allocation';
  protected readonly table = this.dataTableService.createTable(
    PROJECT_WISE_ALLOCATION_TABLE_ENHANCED_CONFIG
  );

  protected fetchPage(
    params: IAllocationSummaryGetFormDto
  ): Observable<IProjectAllocationSummaryGetResponseDto> {
    return this.projectService.getProjectAllocationSummary(params);
  }

  protected toRow(
    record: IProjectAllocationSummaryDto
  ): IProjectAllocationSummaryRow {
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
      currentPeople: record.currentPeople,
      totalPeople: record.totalPeople,
      allocationCount: record.allocationCount,
    };
  }

  protected onRowActionClick(event: ITableActionClickEvent): void {
    const [row] =
      event.selectedRows as unknown as IProjectAllocationSummaryRow[];
    if (event.actionType !== EButtonActionType.EVENT_HISTORY || !row) {
      return;
    }

    this.drawerService.showDrawer(ProjectAllocationRosterComponent, {
      header: 'Project allocations',
      subtitle: 'Who worked on this project and when',
      componentData: {
        siteId: row.siteId,
        projectName: row.docWorkspaceContext.projectName,
        projectLocation: row.docWorkspaceContext.siteLocationSubtitle,
      },
    });
  }
}
