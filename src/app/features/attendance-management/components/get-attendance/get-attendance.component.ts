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
  IConfirmationDialogConfig,
  IConfirmationDialogRecordDetailConfig,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetricData,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/models';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { LoggerService, TimezoneService } from '@core/services';
import {
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
  TableService,
} from '@shared/services';
import {
  ATTENDANCE_TABLE_ENHANCED_CONFIG,
  createAttendanceDialogConfig,
} from '../../config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import {
  IAttendanceActionRequestDto,
  IAttendanceActionResponseDto,
  IAttendanceGetBaseResponseDto,
  IAttendanceGetResponseDto,
  IAttendanceGetStatsResponseDto,
  IAttendanceRegularizedRequestDto,
  IAttendanceRegularizedResponseDto,
} from '../../types/attendance.dto';
import { IAttendance } from '../../types/attendance.interface';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import {
  EDialogType,
  ETableActionType,
  ETableActionTypeValue,
} from '@shared/types';
import { stringToArray } from '@shared/utility';
import { GetAttendanceDetailComponent } from '../get-attendance-detail/get-attendance-detail.component';
import { APP_CONFIG } from '@core/config';
import { DatePipe } from '@angular/common';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { SHIFT_DATA } from '@shared/config';

@Component({
  selector: 'app-get-attendance',
  imports: [DataTableComponent, PageHeaderComponent, MetricsCardComponent],
  providers: [DatePipe],
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
  private readonly notificationService = inject(NotificationService);
  private readonly drawerService = inject(DrawerService);
  private readonly datePipe = inject(DatePipe);
  private readonly timezoneServive = inject(TimezoneService);

  protected table!: IEnhancedTable;

  private readonly attendanceStats =
    signal<IAttendanceGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      ATTENDANCE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.loadAttendanceList();
  }

  private loadAttendanceList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Attendance',
      message: 'Please wait while we load the attendance...',
    });

    this.attendanceService
      .getAttendanceList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceGetResponseDto) => {
          const { records, stats } = response;
          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
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

  private mapTableData(
    response: IAttendanceGetBaseResponseDto[]
  ): Partial<IAttendance>[] {
    return response.map((record: IAttendanceGetBaseResponseDto) => ({
      id: record.id,
      attendanceDate: record.attendanceDate,
      attendanceStatus: record.status,
      approvalStatus: record.approvalStatus,
      notes: record.notes,
      employeeName: `${record.user.firstName} ${record.user.lastName}`,
      employeeId: record.user.id,
      employeeCode: record.user.employeeId,
      siteLocation: stringToArray(record.notes, '-')[0] || '',
      clientName: stringToArray(record.notes, '-')[1] || '',
    }));
  }

  private getMetricCardsData(): IMetricData[] {
    const stats = this.attendanceStats();
    if (!stats) {
      return [];
    }

    return [
      {
        title: 'Approval Status',
        subtitle: 'Request approval overview',
        iconClass: 'pi pi-check-circle',
        iconBgClass: 'bg-indigo-50',
        metrics: [
          { label: 'Approved', value: stats.approval.approved },
          { label: 'Pending', value: stats.approval.pending },
          { label: 'Rejected', value: stats.approval.rejected },
        ],
      },
      {
        title: 'Attendance Status',
        subtitle: 'Employee attendance overview',
        iconClass: 'pi pi-clock',
        iconBgClass: 'bg-indigo-50',
        metrics: [
          { label: 'Present', value: stats.attendance.present },
          { label: 'Absent', value: stats.attendance.absent },
          { label: 'Leave', value: stats.attendance.leave },
          { label: 'Holiday', value: stats.attendance.holiday },
        ],
      },
    ];
  }

  protected handleAttendanceTableActionClick(
    event: ITableActionClickEvent<IAttendance>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;

    switch (actionType) {
      case ETableActionType.APPROVE:
      case ETableActionType.REJECT:
      case ETableActionType.REGULARIZE:
        this.showAttendanceActionDialog(actionType, selectedRows, isBulk);
        break;

      case ETableActionType.VIEW:
        this.showAttendanceDetailsDrawer(selectedRows);
        break;

      default:
        this.logger.warn('Unknown table action:', actionType);
    }
  }

  private showAttendanceActionDialog(
    actionType: ETableActionType,
    selectedRows: IAttendance[],
    isBulk: boolean
  ): void {
    let dialogConfig = {} as IConfirmationDialogConfig;

    switch (actionType) {
      case ETableActionType.APPROVE:
      case ETableActionType.REJECT: {
        const recordDetail = this.prepareAttendanceRecordDetail(selectedRows);
        dialogConfig = createAttendanceDialogConfig(
          actionType,
          recordDetail,
          isBulk,
          !isBulk,
          this.onAttendanceApprovalAction.bind(this, actionType, selectedRows)
        );
        break;
      }
      case ETableActionType.REGULARIZE: {
        const recordDetail = this.prepareAttendanceRecordDetail(selectedRows);
        dialogConfig = createAttendanceDialogConfig(
          actionType,
          recordDetail,
          isBulk,
          !isBulk,
          this.onAttendanceRegularizeAction.bind(this, selectedRows)
        );
        break;
      }
      default:
        this.logger.warn('Unknown action type:', actionType);
    }

    let dialogType = EDialogType.DEFAULT;

    if (actionType === ETableActionType.APPROVE) {
      dialogType = EDialogType.APPROVE;
    } else if (actionType === ETableActionType.REJECT) {
      dialogType = EDialogType.REJECT;
    } else if (actionType === ETableActionType.REGULARIZE) {
      dialogType = EDialogType.REGULARIZE;
    }

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      dialogType
    );
  }

  private onAttendanceApprovalAction(
    actionType: ETableActionType,
    selectedRows: IAttendance[],
    dialogFormData?: Record<string, string>
  ): void {
    const formData = this.prepareAttendanceApprovalFormData(
      actionType,
      selectedRows,
      dialogFormData
    );

    this.executeAttendanceApprovalAction(formData, actionType);
  }

  private prepareAttendanceApprovalFormData(
    actionType: ETableActionType,
    selectedRows: IAttendance[],
    dialogFormData?: Record<string, string>
  ): IAttendanceActionRequestDto {
    const { comment } = dialogFormData as { comment: string };
    let actionTypeValue = '' as ETableActionTypeValue;

    if (actionType === ETableActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
    } else if (actionType === ETableActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
    }

    return {
      approvals: selectedRows.map(row => ({
        attendanceId: row.id,
        approvalStatus: actionTypeValue,
        approvalComment: comment,
      })),
    };
  }

  private executeAttendanceApprovalAction(
    formData: IAttendanceActionRequestDto,
    actionType: ETableActionType
  ): void {
    let loadingMessage;

    if (actionType === ETableActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Attendance',
        message: 'Please wait while we approve the attendance...',
      };
    } else if (actionType === ETableActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Attendance',
        message: 'Please wait while we reject the attendance...',
      };
    }

    this.loadingService.show(loadingMessage);

    this.attendanceService
      .actionAttendance(formData)
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceActionResponseDto) => {
          const { errors, result } = response;
          const hasErrors = errors.length > 0;
          const hasResult = result.length > 0;
          const errorCount = errors.length;
          const resultCount = result.length;
          const recordsCount = result.length + errors.length;

          if (hasErrors && hasResult) {
            if (recordsCount === 1) {
              this.notificationService.error(
                `Failed to ${actionType} attendance`
              );
            } else {
              this.notificationService.error(
                `Failed to ${actionType} attendance for ${errorCount} records and executed successfully for ${resultCount} records`
              );
            }
          } else if (hasErrors) {
            if (recordsCount === 1) {
              this.notificationService.error(
                `Failed to ${actionType} attendance`
              );
            } else {
              this.notificationService.error(
                `Failed to ${actionType} attendance for ${errorCount} records`
              );
            }
          } else if (hasResult) {
            if (recordsCount === 1) {
              this.notificationService.success(
                `Successfully ${actionType} attendance`
              );
            } else {
              this.notificationService.success(
                `Successfully ${actionType} attendance for ${resultCount} records`
              );
            }
          }

          if (hasResult) {
            this.loadAttendanceList();
          }
        },
      });
  }

  private onAttendanceRegularizeAction(
    selectedRows: IAttendance[],
    dialogFormData?: Record<string, string>
  ): void {
    const formData = this.prepareAttendanceRegularizeFormData(
      selectedRows,
      dialogFormData
    );

    const { id: attendanceId } = selectedRows[0];

    this.executeAttendanceRegularizeAction(formData, attendanceId);
  }

  private prepareAttendanceRegularizeFormData(
    selectedRows: IAttendance[],
    dialogFormData?: Record<string, string>
  ): IAttendanceRegularizedRequestDto {
    const { attendanceStatus, clientName, location } = dialogFormData as {
      attendanceStatus: EAttendanceStatus;
      clientName: string;
      location: string;
    };

    const { employeeId } = selectedRows[0];

    return {
      checkInTime: SHIFT_DATA.START_TIME,
      checkOutTime: SHIFT_DATA.END_TIME,
      notes: `${clientName} - ${location}`,
      status: attendanceStatus,
      userId: employeeId,
      timezone: this.timezoneServive.timezone,
    };
  }

  private executeAttendanceRegularizeAction(
    formData: IAttendanceRegularizedRequestDto,
    attendanceId: string
  ): void {
    this.loadingService.show({
      title: 'Regularizing Attendance',
      message: 'Please wait while we regularize the attendance...',
    });

    this.attendanceService
      .regularizedAttendance(formData, attendanceId)
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceRegularizedResponseDto) => {
          const { message } = response;
          this.notificationService.success(message);
          this.loadAttendanceList();
        },
        error: () => {
          this.notificationService.error('Failed to regularize attendance');
        },
      });
  }

  private prepareAttendanceRecordDetail(
    selectedRows: IAttendance[]
  ): IConfirmationDialogRecordDetailConfig {
    const [firstRow] = selectedRows;
    const recordDetail = [
      { label: 'Employee Name', value: firstRow.employeeName },
      {
        label: 'Attendance Date',
        value: this.datePipe.transform(
          firstRow.attendanceDate,
          APP_CONFIG.DATE_FORMATS.DEFAULT
        ) as string,
      },
      { label: 'Attendance Status', value: firstRow.attendanceStatus },
      {
        label: 'Site Location - Client Name',
        value: `${firstRow.siteLocation} - ${firstRow.clientName}`,
      },
    ];
    return {
      details: recordDetail,
    };
  }

  private showAttendanceDetailsDrawer(rowData: IAttendance[]): void {
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
      headerButtonConfig: {
        label: 'Apply Attendance',
        icon: ICONS.COMMON.PLUS,
      },
    };
  }
}
