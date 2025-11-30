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
  IConfirmationDialogRecordDetailConfig,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
  EDialogType,
  EButtonActionType,
} from '@shared/types';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { LoggerService } from '@core/services';
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
import {
  getOriginalDataForSelectedRows,
  stringToArray,
  transformDateFormat,
} from '@shared/utility';
import { GetAttendanceDetailComponent } from '../get-attendance-detail/get-attendance-detail.component';
import { APP_CONFIG } from '@core/config';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { TableLazyLoadEvent } from 'primeng/table';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';

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

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private originalAttendanceData: IAttendanceGetBaseResponseDto[] = [];
  private readonly attendanceStats =
    signal<IAttendanceGetStatsResponseDto | null>(null);

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

          this.originalAttendanceData = records;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.attendanceStats.set(stats);
          this.logger.logUserAction('Attendance records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.originalAttendanceData = [];
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
    return response.map((record: IAttendanceGetBaseResponseDto) => ({
      id: record.id,
      attendanceDate: record.attendanceDate,
      attendanceStatus: record.status,
      approvalStatus: record.approvalStatus,
      employeeName: `${record.user.firstName} ${record.user.lastName}`,
      employeeCode: record.user.employeeId,
      siteLocation: stringToArray(record.notes, '-')[0] || '',
      clientName: stringToArray(record.notes, '-')[1] || '',
    }));
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
    event: ITableActionClickEvent<IAttendance>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;

    const originalSelectedRows = getOriginalDataForSelectedRows<
      IAttendance,
      IAttendanceGetBaseResponseDto
    >(selectedRows, this.originalAttendanceData, 'id');

    if (actionType === EButtonActionType.VIEW) {
      this.showAttendanceDetailsDrawer(originalSelectedRows);
      return;
    }

    const dialogTypeMap: Record<string, EDialogType> = {
      [EButtonActionType.APPROVE]: EDialogType.APPROVE,
      [EButtonActionType.REJECT]: EDialogType.REJECT,
      [EButtonActionType.REGULARIZE]: EDialogType.REGULARIZE,
    };

    const dialogType = dialogTypeMap[actionType];

    if (!dialogType) {
      this.logger.warn('Unknown table action:', actionType);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: originalSelectedRows,
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

    const recordDetail =
      this.prepareAttendanceRecordDetail(originalSelectedRows);
    const dialogConfig = this.confirmationDialogService.createDialogConfig(
      actionType,
      ATTENDANCE_ACTION_CONFIG_MAP,
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      dialogType
    );
  }

  private prepareAttendanceRecordDetail(
    selectedRows: IAttendanceGetBaseResponseDto[]
  ): IConfirmationDialogRecordDetailConfig {
    const [firstRow] = selectedRows;
    const recordDetail = [
      {
        label: 'Employee Name',
        value: `${firstRow.user.firstName} ${firstRow.user.lastName}`,
      },
      {
        label: 'Attendance Date',
        value: transformDateFormat(
          firstRow.attendanceDate,
          APP_CONFIG.DATE_FORMATS.DEFAULT
        ),
      },
      { label: 'Attendance Status', value: firstRow.status },
      {
        label: 'Site Location - Client Name',
        value: `${firstRow.notes}`,
      },
    ];
    return {
      details: recordDetail,
    };
  }

  private showAttendanceDetailsDrawer(
    rowData: IAttendanceGetBaseResponseDto[]
  ): void {
    this.logger.logUserAction('Opening attendance details drawer', rowData);

    this.drawerService.showDrawer(GetAttendanceDetailComponent, {
      header: `Attendance Details`,
      subtitle: `Detailed view of attendance`,
      componentData: {
        attendance: rowData[0],
      },
    });
  }

  protected onAddButtonClick(): void {
    const navigationRoute = [
      ROUTE_BASE_PATHS.ATTENDANCE,
      ROUTES.ATTENDANCE.APPLY,
    ];
    const success =
      this.routerNavigationService.navigateToRoute(navigationRoute);
    if (!success) {
      this.logger.logUserAction(
        'Navigation failed for add button',
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
          label: 'Apply Attendance',
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
        },
      ],
    };
  }
}
