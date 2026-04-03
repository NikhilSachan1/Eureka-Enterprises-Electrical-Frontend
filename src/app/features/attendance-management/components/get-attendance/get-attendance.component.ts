import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
  EButtonActionType,
  EDataType,
} from '@shared/types';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableService,
  TableServerSideParamsBuilderService,
  AppConfigurationService,
} from '@shared/services';
import {
  ATTENDANCE_ACTION_CONFIG_MAP,
  ATTENDANCE_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_ATTENDANCE_FORM_CONFIG,
} from '../../config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import {
  IAttendanceGetBaseResponseDto,
  IAttendanceGetFormDto,
  IAttendanceGetResponseDto,
  IAttendanceGetStatsResponseDto,
} from '../../types/attendance.dto';
import { IAttendance } from '../../types/attendance.interface';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { GetAttendanceDetailComponent } from '../get-attendance-detail/get-attendance-detail.component';
import { APP_CONFIG } from '@core/config';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { TableLazyLoadEvent } from 'primeng/table';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-attendance',
  imports: [
    DataTableComponent,
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
  ],
  providers: [],
  templateUrl: './get-attendance.component.html',
  styleUrl: './get-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAttendanceComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly attendanceStats =
    signal<IAttendanceGetStatsResponseDto | null>(null);
  protected readonly ALL_ICONS = ICONS;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      ATTENDANCE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_ATTENDANCE_FORM_CONFIG;
  }

  private loadAttendanceList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Attendance',
      message: 'Please wait while we load the attendance...',
    });

    const paramData = this.prepareParamData();

    this.attendanceService
      .getAttendanceList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.attendanceStats.set(stats);
          this.logger.logUserAction('Attendance records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.attendanceStats.set(null);
          this.logger.logUserAction('Failed to load attendance records', error);
        },
      });
  }

  private prepareParamData(): IAttendanceGetFormDto {
    const queryFilterParams =
      this.tableServerSideFilterAndSortService.buildQueryParams<IAttendanceGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return queryFilterParams;
  }

  private mapTableData(
    response: IAttendanceGetBaseResponseDto[]
  ): IAttendance[] {
    const attendanceStatus = this.appConfigurationService.attendanceStatus();
    const approvalStatus = this.appConfigurationService.approvalStatus();

    return response.map((record: IAttendanceGetBaseResponseDto) => {
      return {
        id: record.id,
        attendanceDate: record.attendanceDate,
        attendanceStatus: getMappedValueFromArrayOfObjects(
          attendanceStatus,
          record.status
        ),
        approvalStatus: getMappedValueFromArrayOfObjects(
          approvalStatus,
          record.approvalStatus
        ),
        employeeName: `${record.user.firstName} ${record.user.lastName}`,
        employeeCode: record.user.employeeId,
        attendanceType: record.attendanceType,
        assignmentSnapshot: {
          ...record.assignmentSnapshot,
          contractorsDisplay:
            record.assignmentSnapshot?.contractors
              ?.map(c => c?.name)
              .filter(Boolean)
              .join(', ') ?? null,
          vehicleDisplay:
            record.assignmentSnapshot?.vehicle?.registrationNo ?? null,
          assignedEngineerDisplay: ((): string | null => {
            const firstName =
              record.assignmentSnapshot?.assignedEngineer?.firstName;
            const lastName =
              record.assignmentSnapshot?.assignedEngineer?.lastName;
            if (!firstName && !lastName) {
              return null;
            }
            return `${firstName ?? ''} ${lastName ?? ''}`.trim() || null;
          })(),
        },
        originalRawData: record,
      } satisfies IAttendance;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadAttendanceList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.attendanceStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'attendance',
        title: 'Attendance Statistics',
        icon: 'pi pi-calendar',
        metrics: [
          { label: 'Present', value: stats.attendance.present },
          { label: 'Absent', value: stats.attendance.absent },
          { label: 'Leave', value: stats.attendance.leave },
          { label: 'Total', value: stats.attendance.total || 0 },
        ],
      },
      {
        id: 'approval',
        title: 'Approval Status',
        icon: 'pi pi-check-circle',
        metrics: [
          { label: 'Pending', value: stats.approval.pending },
          { label: 'Approved', value: stats.approval.approved },
          { label: 'Rejected', value: stats.approval.rejected },
          { label: 'Total', value: stats.approval.total || 0 },
        ],
      },
    ];
  }

  protected handleAttendanceTableActionClick(
    event: ITableActionClickEvent<IAttendanceGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showAttendanceDetailsDrawer(selectedFirstRow);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadAttendanceList();
      },
    };

    if (
      actionType === EButtonActionType.APPROVE ||
      actionType === EButtonActionType.REJECT
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareAttendanceRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      ATTENDANCE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareAttendanceRecordDetail(
    selectedRow: IAttendanceGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Date',
        value: selectedRow.attendanceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Status',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.attendanceStatus(),
          selectedRow.status
        ),
        type: EDataType.STATUS,
      },
      {
        label: 'Company',
        value: selectedRow.assignmentSnapshot?.company?.name ?? 'N/A',
      },
      {
        label: 'Contractors',
        value:
          selectedRow.assignmentSnapshot?.contractors
            ?.map(c => c?.name)
            .join(', ') ?? 'N/A',
      },
      {
        label: 'Assigned Engineer',
        value: ((): string => {
          const firstName =
            selectedRow.assignmentSnapshot?.assignedEngineer?.firstName;
          const lastName =
            selectedRow.assignmentSnapshot?.assignedEngineer?.lastName;
          if (!firstName && !lastName) {
            return 'N/A';
          }
          return `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'N/A';
        })(),
      },
      {
        label: 'Associated Vehicle',
        value: selectedRow.assignmentSnapshot?.vehicle?.registrationNo ?? 'N/A',
      },
    ];

    return {
      details: [
        {
          status: {
            entryType: selectedRow.attendanceType,
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

  private showAttendanceDetailsDrawer(
    rowData: IAttendanceGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Opening attendance details drawer', rowData);

    this.drawerService.showDrawer(GetAttendanceDetailComponent, {
      header: `Attendance Details`,
      subtitle: `Detailed view of attendance`,
      componentData: {
        attendance: rowData,
      },
    });
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'forceAttendance') {
      navigationRoute = [ROUTE_BASE_PATHS.ATTENDANCE, ROUTES.ATTENDANCE.FORCE];
    } else if (actionName === 'applyAttendance') {
      navigationRoute = [ROUTE_BASE_PATHS.ATTENDANCE, ROUTES.ATTENDANCE.APPLY];
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
      title: 'Attendance Management',
      subtitle: 'Manage attendance records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Force Attendance',
          icon: ICONS.COMMON.FORCE,
          actionName: 'forceAttendance',
          permission: [APP_PERMISSION.ATTENDANCE.FORCE],
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Apply Attendance',
          icon: ICONS.ATTENDANCE.CHECK_IN,
          actionName: 'applyAttendance',
          permission: [APP_PERMISSION.ATTENDANCE.APPLY],
        },
      ],
    };
  }
}
