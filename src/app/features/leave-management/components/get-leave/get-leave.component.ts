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
  filterActionableLeaveDays,
  getActionableLeaveDays,
  LEAVE_ACTION_CONFIG_MAP,
  LEAVE_DAY_ROW_ACTIONS_CONFIG,
  LEAVE_NO_ACTIONABLE_DAY_MESSAGE,
  LEAVE_GROUP_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_LEAVE_FORM_CONFIG,
} from '@features/leave-management/config';
import {
  ILeaveGetBaseResponseDto,
  ILeaveGetFormDto,
  ILeaveGetStatsResponseDto,
  ILeaveGroupGetBaseResponseDto,
  ILeaveGroupGetResponseDto,
} from '@features/leave-management/types/leave.dto';
import {
  ILeaveDay,
  ILeaveGroup,
} from '@features/leave-management/types/leave.interface';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  NotificationService,
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
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableActionConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { GetLeaveDetailComponent } from '../get-leave-detail/get-leave-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { LeaveService } from '@features/leave-management/services/leave.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import {
  applyGroupMetricValueLoading,
  getMappedValueFromArrayOfObjects,
} from '@shared/utility';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { buildLeaveStatusChips } from '@features/leave-management/utils/leave.util';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-get-leave',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    StatusTagComponent,
    DatePipe,
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

  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  /** One row per leave application (the days applied together). */
  protected table!: IEnhancedTable;
  /** Applications on the current page. */
  private readonly groups = signal<ILeaveGroupGetBaseResponseDto[]>([]);

  /**
   * The page's selection, kept as days: ticking an application ticks all its days, unticking a
   * day unticks its application. The bulk bar works on these days.
   */
  private readonly selectedDayIds = signal<ReadonlySet<string>>(new Set());

  /** Applications whose every day is selected — shown ticked in the main table. */
  protected readonly selectedGroupIds = computed(() => {
    const days = this.selectedDayIds();
    return this.groups()
      .filter(group => group.records.every(day => days.has(day.id)))
      .map(group => group.groupId);
  });

  /** Selected days, for the bulk bar. */
  protected readonly selectedDays = computed(() => {
    const days = this.selectedDayIds();
    return this.groups()
      .flatMap(group => group.records)
      .filter(day => days.has(day.id));
  });

  /** Approve / reject / cancel on each day row, styled like the row actions above. */
  protected dayRowActions: Partial<ITableActionConfig>[] = [];

  /** One day of an expanded application. */
  protected handleLeaveDayActionClick(
    event: ITableActionClickEvent<ILeaveGetBaseResponseDto>
  ): void {
    this.openLeaveActionDialog(event.actionType, event.selectedRows, false);
  }

  /** Day rows of an expanded application. */
  protected readonly daysOf = (
    row: Record<string, unknown>
  ): Record<string, unknown>[] =>
    (row as unknown as ILeaveGroup).days as unknown as Record<
      string,
      unknown
    >[];

  protected readonly isDayRowSelected = (
    day: Record<string, unknown>
  ): boolean => this.selectedDayIds().has(String(day['id']));

  /** Some, not all, of its days ticked: the row shows "–". */
  protected readonly isGroupPartiallySelected = (
    row: Record<string, unknown>
  ): boolean => {
    const days = (row as unknown as ILeaveGroup).days ?? [];
    const ticked = days.filter(day => this.selectedDayIds().has(day.id)).length;
    return ticked > 0 && ticked < days.length;
  };
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly leaveStats = signal<ILeaveGetStatsResponseDto | null>(null);
  /** Derived from the last list request params — not from raw table UI state (avoids false positives). */
  private readonly showLeaveBalanceMetrics = signal(false);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      LEAVE_GROUP_TABLE_ENHANCED_CONFIG
    );
    // Same defaults (outlined buttons) as every table's row actions.
    this.dayRowActions = this.dataTableService
      .createTable({
        tableConfig: {},
        headers: [],
        rowActions: LEAVE_DAY_ROW_ACTIONS_CONFIG,
        bulkActions: [],
      })
      .getRowActions() as unknown as Partial<ITableActionConfig>[];
    this.searchFilterConfig = SEARCH_FILTER_LEAVE_FORM_CONFIG;
  }

  private loadLeaveList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.leaveService
      .getLeaveGroupList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILeaveGroupGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          this.appConfigurationService.runAfterTouchedConfiguration(
            () => this.mapTableData(records),
            mappedData => this.table.setData(mappedData)
          );
          this.table.updateTableConfig({ totalRecords });
          this.showLeaveBalanceMetrics.set(
            this.shouldShowLeaveBalanceMetricsForRole(paramData)
          );
          this.leaveStats.set(stats);
          this.logger.logUserAction('Leave applications loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.leaveStats.set(null);
          this.showLeaveBalanceMetrics.set(false);
          this.logger.logUserAction('Failed to load leave applications', error);
        },
      });
  }

  private prepareParamData(): ILeaveGetFormDto {
    const queryFilterParams =
      this.tableServerSideFilterAndSortService.buildQueryParams<ILeaveGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return queryFilterParams;
  }

  private mapTableData(groups: ILeaveGroupGetBaseResponseDto[]): ILeaveGroup[] {
    this.groups.set(groups);
    this.selectedDayIds.set(new Set());
    return groups.map(group => {
      return {
        id: group.groupId,
        leaveDate: [group.fromDate, group.toDate],
        dayCountLabel:
          group.dayCount === 1 ? '1 day' : `${group.dayCount} days`,
        reason: group.reason,
        approvalStatus: group.approvalStatus,
        statusChips: buildLeaveStatusChips(group.statusCounts),
        employeeName: `${group.user.firstName} ${group.user.lastName}`,
        employeeCode: group.user.employeeId,
        days: group.records.map(day => this.mapLeaveDay(day)),
        originalRawData: group,
      };
    });
  }

  private mapLeaveDay(day: ILeaveGetBaseResponseDto): ILeaveDay {
    return {
      id: day.id,
      leaveDay: day.fromDate,
      approvalStatus: this.statusLabel(day.approvalStatus),
      originalRawData: day,
    };
  }

  private statusLabel(status: string): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.approvalStatus(),
      status
    );
  }

  /** Main table ticks: a newly ticked application adds all its days, an unticked one drops them. */
  protected onGroupSelectionChange(rows: Record<string, unknown>[]): void {
    const ticked = new Set(
      (rows as ILeaveGroupGetBaseResponseDto[]).map(group => group.groupId)
    );
    const shown = new Set(this.selectedGroupIds());
    if (ticked.size === shown.size && [...ticked].every(id => shown.has(id))) {
      return; // the table only echoed our own selection
    }

    const days = new Set(this.selectedDayIds());
    for (const group of this.groups()) {
      if (ticked.has(group.groupId) && !shown.has(group.groupId)) {
        group.records.forEach(day => days.add(day.id));
      } else if (!ticked.has(group.groupId) && shown.has(group.groupId)) {
        group.records.forEach(day => days.delete(day.id));
      }
    }
    this.selectedDayIds.set(days);
  }

  /** Tick / untick one day row. */
  protected toggleDay(dayId: string): void {
    const days = new Set(this.selectedDayIds());
    if (days.has(dayId)) {
      days.delete(dayId);
    } else {
      days.add(dayId);
    }
    this.selectedDayIds.set(days);
  }

  /** A partly ticked application's "–" ticks all its days. */
  protected selectAllDays(group: ILeaveGroup): void {
    const days = new Set(this.selectedDayIds());
    group.days.forEach(day => days.add(day.id));
    this.selectedDayIds.set(days);
  }

  protected clearDaySelection(): void {
    this.selectedDayIds.set(new Set());
  }

  /** Only applications of more than one day open into their days. */
  protected readonly hasSeveralDays = (row: Record<string, unknown>): boolean =>
    Array.isArray(row['days']) && row['days'].length > 1;

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadLeaveList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.leaveStats();
    const loading = this.table.loading();

    const groups: IMetricGroup[] = [
      {
        id: 'approval',
        title: 'Approval Status',
        icon: ICONS.ACTIONS.CHECK_CIRCLE,
        metrics: [
          {
            label: 'Total',
            value: stats?.approval?.total ?? 0,
            filter: { approvalStatus: null },
          },
          {
            label: 'Approved',
            value: stats?.approval?.approved ?? 0,
            filter: { approvalStatus: 'approved' },
          },
          {
            label: 'Pending',
            value: stats?.approval?.pending ?? 0,
            filter: { approvalStatus: 'pending' },
          },
          {
            label: 'Rejected',
            value: stats?.approval?.rejected ?? 0,
            filter: { approvalStatus: 'rejected' },
          },
          {
            label: 'Cancelled',
            value: stats?.approval?.cancelled ?? 0,
            filter: { approvalStatus: 'cancelled' },
          },
        ],
      },
    ];

    if (this.showLeaveBalanceMetrics()) {
      groups.push({
        id: 'balance',
        title: 'Leave Balance',
        icon: ICONS.COMMON.CHART_LINE,
        metrics: [
          {
            label: 'Total Credited',
            value: stats?.leaveBalance?.totalCredited ?? 0,
            icon: ICONS.COMMON.ARROW_UP,
          },
          {
            label: 'Total Consumed',
            value: stats?.leaveBalance?.totalConsumed ?? 0,
            icon: ICONS.COMMON.ARROW_DOWN,
          },
          {
            label: 'Total Balance',
            value: stats?.leaveBalance?.totalBalance ?? 0,
            icon: ICONS.COMMON.CHART_LINE,
          },
        ],
      });
    }

    return applyGroupMetricValueLoading(groups, loading);
  }

  /**
   * Managerial roles see leave balance only when exactly one employee is filtered (scoped stats).
   * Other roles always see their own / default balance block when stats exist.
   */
  private shouldShowLeaveBalanceMetricsForRole(
    params: ILeaveGetFormDto
  ): boolean {
    if (!this.authService.isActiveRoleManagerial()) {
      return true;
    }
    return this.hasExactlyOneValidEmployeeFilter(params);
  }

  /** Must match what {@link prepareParamData} sends as `employeeName` (UUID strings). */
  private hasExactlyOneValidEmployeeFilter(params: ILeaveGetFormDto): boolean {
    const raw = params?.employeeName;
    if (!Array.isArray(raw) || raw.length !== 1) {
      return false;
    }
    return this.extractEmployeeFilterId(raw[0]).length > 0;
  }

  private extractEmployeeFilterId(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'object' && value !== null && 'value' in value) {
      const v = (value as { value: unknown }).value;
      return v === undefined || v === null ? '' : String(v).trim();
    }
    return String(value).trim();
  }

  /** Application row / bulk: acts on the days of the application(s) the action applies to. */
  protected handleLeaveTableActionClick(
    event: ITableActionClickEvent<ILeaveGroupGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showLeaveDetailsDrawer(selectedFirstRow);
      return;
    }

    const days = getActionableLeaveDays(actionType, selectedRows);
    if (!days.length) {
      return;
    }
    this.openLeaveActionDialog(
      actionType,
      days,
      isBulk || selectedRows.length > 1
    );
  }

  /** Bulk bar: the selected days that the action allows. */
  protected handleLeaveBulkActionClick(
    event: ITableActionClickEvent<ILeaveGetBaseResponseDto>
  ): void {
    const days = filterActionableLeaveDays(
      event.actionType,
      event.selectedRows
    );
    if (!days.length) {
      this.notificationService.error(
        LEAVE_NO_ACTIONABLE_DAY_MESSAGE[event.actionType] ??
          'None of the selected days can take this action.'
      );
      return;
    }
    this.openLeaveActionDialog(event.actionType, days, true);
  }

  private openLeaveActionDialog(
    actionType: EButtonActionType,
    selectedRows: ILeaveGetBaseResponseDto[],
    isBulk: boolean
  ): void {
    const [selectedFirstRow] = selectedRows;

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

    const recordDetail = this.prepareLeaveRecordDetail(
      selectedFirstRow,
      selectedRows
    );

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
    selectedRow: ILeaveGetBaseResponseDto,
    days: ILeaveGetBaseResponseDto[]
  ): IDataViewDetailsWithEntity {
    const lastDay = days[days.length - 1] ?? selectedRow;
    const entryData: IDataViewDetails['entryData'] = [
      {
        label:
          days.length > 1 ? `Leave Date (${days.length} days)` : 'Leave Date',
        value: [selectedRow.fromDate, lastDay.toDate],
        type: EDataType.RANGE,
        dataType: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      { label: 'Reason', value: selectedRow.reason },
    ];
    return {
      details: [
        {
          status: {
            entryType: selectedRow.leaveApplicationType,
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.approvalStatus(),
              selectedRow.approvalStatus
            ),
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

  private showLeaveDetailsDrawer(group: ILeaveGroupGetBaseResponseDto): void {
    this.logger.logUserAction('Opening leave details drawer', group);

    this.drawerService.showDrawer(GetLeaveDetailComponent, {
      header: `Leave Details`,
      subtitle: `Day-wise status of the leave`,
      componentData: {
        group,
      },
    });
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'forceLeave') {
      navigationRoute = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.FORCE];
    } else if (actionName === 'applyLeave') {
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
          permission: [APP_PERMISSION.LEAVE.FORCE],
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Apply Leave',
          showInEmptyState: true,
          icon: ICONS.COMMON.CALENDAR_PLUS,
          actionName: 'applyLeave',
          permission: [APP_PERMISSION.LEAVE.APPLY],
        },
      ],
    };
  }
}
