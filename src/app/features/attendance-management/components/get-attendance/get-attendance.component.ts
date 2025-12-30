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
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
  EButtonActionType,
  EDataType,
} from '@shared/types';
import {
  ICONS,
  PERMISSION_KEYS,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { AppPermissionService, LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableService,
  TableServerSideParamsBuilderService,
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
  IAttendanceGetRequestDto,
  IAttendanceGetResponseDto,
  IAttendanceGetStatsResponseDto,
} from '../../types/attendance.dto';
import { IAttendance } from '../../types/attendance.interface';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import { stringToArray } from '@shared/utility';
import { GetAttendanceDetailComponent } from '../get-attendance-detail/get-attendance-detail.component';
import { APP_CONFIG } from '@core/config';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { TableLazyLoadEvent } from 'primeng/table';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { ChipComponent } from '@shared/components/chip/chip.component';

@Component({
  selector: 'app-get-attendance',
  imports: [
    DataTableComponent,
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    ChipComponent,
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
  private readonly appPermissionService = inject(AppPermissionService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly attendanceStats =
    signal<IAttendanceGetStatsResponseDto | null>(null);
  protected readonly ALL_ICONS = ICONS;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

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

  private prepareParamData(): IAttendanceGetRequestDto {
    const queryFilterParams =
      this.tableServerSideFilterAndSortService.buildQueryParams<IAttendanceGetRequestDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return queryFilterParams;
  }

  private mapTableData(
    response: IAttendanceGetBaseResponseDto[]
  ): IAttendance[] {
    return response.map((record: IAttendanceGetBaseResponseDto) => {
      const [clientName, siteLocation] = stringToArray(record.notes, '-');
      const associateEngineerName = 'John Doe'; // TODO: Add associate employee name once we have the associate employee name functionality
      const associatedVehicle = 'Vehicle 1'; // TODO: Add associated vehicle once we have the associated vehicle functionality

      return {
        id: record.id,
        attendanceDate: record.attendanceDate,
        attendanceStatus: record.status,
        approvalStatus: record.approvalStatus,
        employeeName: `${record.user.firstName} ${record.user.lastName}`,
        employeeCode: record.user.employeeId,
        siteLocation: siteLocation || 'N/A',
        clientName: clientName || 'N/A',
        associateEngineerName: associateEngineerName || 'N/A',
        associatedVehicle: associatedVehicle || 'N/A',
        attendanceType: record.attendanceType,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadAttendanceList();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.attendanceStats();
    if (!stats) {
      return [];
    }

    return [
      { label: 'Approved', value: stats.approval.approved },
      { label: 'Pending', value: stats.approval.pending },
      { label: 'Rejected', value: stats.approval.rejected },
      { label: 'Present', value: stats.attendance.present },
      { label: 'Absent', value: stats.attendance.absent },
      { label: 'Leave', value: stats.attendance.leave },
      { label: 'Holiday', value: stats.attendance.holiday },
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
    const siteLocation = stringToArray(selectedRow.notes, '-')[0] || '';
    const clientName = stringToArray(selectedRow.notes, '-')[1] || '';
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Date',
        value: selectedRow.attendanceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Status',
        value: selectedRow.status,
        type: EDataType.STATUS,
      },
      { label: 'Approval Status', value: selectedRow.approvalStatus },
      {
        label: 'Site Location',
        value: siteLocation,
      },
    ];

    if (
      this.appPermissionService.hasUIPermission(
        PERMISSION_KEYS.ATTENDANCE.CLIENT_NAME
      )
    ) {
      entryData.push({
        label: 'Client Name',
        value: clientName,
      });
    }
    if (
      this.appPermissionService.hasUIPermission(
        PERMISSION_KEYS.ATTENDANCE.ASSOCIATE_ENGINEER_NAME
      )
    ) {
      entryData.push({
        label: 'Associate Engineer',
        value: 'John Doe', // TODO: Add associate employee name once we have the associate employee name functionality
      });
    }
    entryData.push({
      label: 'Associated Vehicle',
      value: 'Vehicle 1', // TODO: Add associated vehicle once we have the associated vehicle functionality
    });
    return {
      details: [
        {
          status: {
            entryType: selectedRow.attendanceType,
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
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Apply Attendance',
          icon: ICONS.ATTENDANCE.CHECK_IN,
          actionName: 'applyAttendance',
        },
      ],
    };
  }
}
