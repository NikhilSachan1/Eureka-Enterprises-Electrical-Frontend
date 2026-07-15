import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import {
  SEARCH_FILTER_WORKFORCE_ALLOCATION_FORM_CONFIG,
  WORKFORCE_ALLOCATION_ACTION_CONFIG_MAP,
  WORKFORCE_ALLOCATION_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { ProjectService } from '../../services/project.service';
import {
  IWorkforceAllocationGetBaseResponseDto,
  IWorkforceAllocationGetFormDto,
  IWorkforceAllocationGetResponseDto,
  IWorkforceAllocationGetStatsDto,
} from '../../types/project.dto';
import { IWorkforceAllocation } from '../../types/workforce-allocation.interface';
import { ICONS } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import {
  applyGroupMetricValueLoading,
  getMappedValueFromArrayOfObjects,
  toTitleCase,
} from '@shared/utility';

@Component({
  selector: 'app-get-workforce-allocation',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-workforce-allocation.component.html',
  styleUrl: './get-workforce-allocation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetWorkforceAllocationComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly projectService = inject(ProjectService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideParamsBuilderService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly allocationStats =
    signal<IWorkforceAllocationGetStatsDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      WORKFORCE_ALLOCATION_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_WORKFORCE_ALLOCATION_FORM_CONFIG;
  }

  private loadWorkforceAllocation(): void {
    this.table.setLoading(true);

    this.projectService
      .getWorkforceAllocationEmployees(this.prepareParamData())
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IWorkforceAllocationGetResponseDto) => {
          const { records, stats, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.allocationStats.set(stats);
          this.logger.logUserAction(
            'Workforce allocation records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.allocationStats.set(null);
          this.logger.logUserAction(
            'Failed to load workforce allocation records',
            error
          );
        },
      });
  }

  private prepareParamData(): IWorkforceAllocationGetFormDto {
    return this.tableServerSideParamsBuilderService.buildQueryParams<IWorkforceAllocationGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    records: IWorkforceAllocationGetBaseResponseDto[]
  ): IWorkforceAllocation[] {
    return records.map(record => {
      const { currentProject } = record;

      return {
        id: record.userId,
        employeeName: toTitleCase(record.employeeName),
        employeeCode: record.employeeCode,
        allocatedStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectAllocationStatuses(),
          record.status
        ),
        projectName: currentProject?.siteName ?? null,
        allocatedSince: currentProject?.since
          ? new Date(currentProject.since)
          : null,
        originalRawData: record,
      } satisfies IWorkforceAllocation;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadWorkforceAllocation();
  }

  protected handleTableActionClick(
    event: ITableActionClickEvent<IWorkforceAllocationGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const selectedRow = selectedRows[0];

    if (!selectedRow) {
      return;
    }

    if (
      actionType !== EButtonActionType.ALLOCATE &&
      actionType !== EButtonActionType.TRANSFER &&
      actionType !== EButtonActionType.DEALLOCATE
    ) {
      return;
    }

    const actionConfig = WORKFORCE_ALLOCATION_ACTION_CONFIG_MAP[actionType];
    if (!actionConfig) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      actionConfig,
      this.prepareRecordDetail(selectedRow),
      false,
      true,
      {
        selectedRecord: selectedRows,
        dialogActionType: actionType,
        onSuccess: () => {
          this.loadWorkforceAllocation();
        },
      }
    );
  }

  private prepareRecordDetail(
    selectedRow: IWorkforceAllocationGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Current Project',
        value: selectedRow.currentProject?.siteName ?? '—',
      },
    ];

    if (selectedRow.currentProject?.since) {
      entryData.push({
        label: 'Allocated Since',
        value: selectedRow.currentProject.since,
        type: EDataType.DATE,
        dataType: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      });
    }

    return {
      details: [
        {
          status: {
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.projectAllocationStatuses(),
              selectedRow.status
            ),
          },
          entryData,
        },
      ],
      entity: {
        name: toTitleCase(selectedRow.employeeName),
        subtitle: selectedRow.employeeCode,
      },
    };
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.allocationStats();
    const loading = this.table?.loading() ?? false;

    const groups: IMetricGroup[] = [
      {
        id: 'workforce-allocation-counts',
        title: 'Workforce Overview',
        icon: ICONS.EMPLOYEE.GROUP,
        metrics: [
          { label: 'Total Employees', value: stats?.total ?? 0 },
          { label: 'Allocated', value: stats?.allocated ?? 0 },
          { label: 'Free', value: stats?.free ?? 0 },
        ],
      },
    ];

    return applyGroupMetricValueLoading(groups, loading);
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Workforce Allocation',
      subtitle:
        'See who is free or allocated, and manage site assignments from one place',
      showHeaderButton: false,
    };
  }
}
