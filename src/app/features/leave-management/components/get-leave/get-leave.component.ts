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
  LEAVE_ACTION_CONFIG_MAP,
  LEAVE_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_LEAVE_FORM_CONFIG,
} from '@features/leave-management/config';
import {
  ILeaveGetBaseResponseDto,
  ILeaveGetRequestDto,
  ILeaveGetResponseDto,
  ILeaveGetStatsResponseDto,
} from '@features/leave-management/types/leave.dto';
import { ILeave } from '@features/leave-management/types/leave.interface';
import {
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { GetLeaveDetailComponent } from '../get-leave-detail/get-leave-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { FilterMetadata } from 'primeng/api';

@Component({
  selector: 'app-get-leave',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-leave.component.html',
  styleUrl: './get-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetLeaveComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly leaveService = inject(LeaveService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly leaveStats = signal<ILeaveGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      LEAVE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_LEAVE_FORM_CONFIG;
  }

  private loadLeaveList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Leave',
      message: 'Please wait while we load the leave applications...',
    });

    const paramData = this.prepareParamData();

    this.leaveService
      .getLeaveList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILeaveGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.leaveStats.set(stats);
          this.logger.logUserAction('Leave applications loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.leaveStats.set(null);
          this.logger.logUserAction('Failed to load leave applications', error);
        },
      });
  }

  private prepareParamData(): ILeaveGetRequestDto {
    const queryFilterParams =
      this.tableServerSideFilterAndSortService.buildQueryParams<ILeaveGetRequestDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return queryFilterParams;
  }

  private mapTableData(response: ILeaveGetBaseResponseDto[]): ILeave[] {
    return response.map((record: ILeaveGetBaseResponseDto) => {
      return {
        id: record.id,
        leaveDate: [record.fromDate, record.toDate],
        reason: record.reason,
        approvalStatus: record.approvalStatus,
        employeeName: `${record.user.firstName} ${record.user.lastName}`,
        employeeCode: record.user.employeeId,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadLeaveList();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.leaveStats();
    if (!stats) {
      return [];
    }

    const leaveStats = [
      { label: 'Total', value: stats.approval.total },
      { label: 'Approved', value: stats.approval.approved },
      { label: 'Pending', value: stats.approval.pending },
      { label: 'Rejected', value: stats.approval.rejected },
      { label: 'Cancelled', value: stats.approval.cancelled },
      { label: 'Total Consumed', value: stats.leaveBalance.totalConsumed },
    ];

    const isEmployeeFilterActive = (
      this.tableFilterData.filters?.['employeeName'] as FilterMetadata
    )?.value as string[];

    if (isEmployeeFilterActive && isEmployeeFilterActive.length > 0) {
      leaveStats.push(
        { label: 'Total Credited', value: stats.leaveBalance.totalCredited },
        { label: 'Total Balance', value: stats.leaveBalance.totalBalance }
      );
    }

    return leaveStats;
  }

  protected handleLeaveTableActionClick(
    event: ITableActionClickEvent<ILeaveGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showLeaveDetailsDrawer(selectedFirstRow);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadLeaveList();
      },
    };

    if (
      actionType === EButtonActionType.APPROVE ||
      actionType === EButtonActionType.REJECT ||
      actionType === EButtonActionType.CANCEL
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareLeaveRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      LEAVE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareLeaveRecordDetail(
    selectedRow: ILeaveGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Leave Date',
        value: [selectedRow.fromDate, selectedRow.toDate],
        type: EDataType.DATE_RANGE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      { label: 'Reason', value: selectedRow.reason },
    ];
    return {
      details: [
        {
          status: {
            entryType: selectedRow.leaveApplicationType,
            approvalStatus: selectedRow.approvalStatus,
          },
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.user.firstName} ${selectedRow.user.lastName}`,
        subtitle: selectedRow.user.employeeId,
      },
    };
  }

  private showLeaveDetailsDrawer(rowData: ILeaveGetBaseResponseDto): void {
    this.logger.logUserAction('Opening leave details drawer', rowData);

    this.drawerService.showDrawer(GetLeaveDetailComponent, {
      header: `Leave Details`,
      subtitle: `Detailed view of leave`,
      componentData: {
        leave: rowData,
      },
    });
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'forceLeave') {
      navigationRoute = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.FORCE];
    } else if (actionName === 'addLeave') {
      navigationRoute = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.APPLY];
    }
    const success =
      this.routerNavigationService.navigateToRoute(navigationRoute);

    if (!success) {
      this.logger.logUserAction(
        'Navigation failed for header button',
        navigationRoute
      );
    }
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Leave Management',
      subtitle: 'Manage leave records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Force Leave',
          icon: ICONS.COMMON.FORCE,
          actionName: 'forceLeave',
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Apply Leave',
          icon: ICONS.COMMON.PLUS,
          actionName: 'applyLeave',
        },
      ],
    };
  }
}
