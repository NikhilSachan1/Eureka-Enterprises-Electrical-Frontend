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
  IBulkActionClickEvent,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetricData,
  IPageHeaderConfig,
  IRowActionClickEvent,
} from '@shared/models';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { LoggerService } from '@core/services';
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
  createAttendanceApproveDialogConfig,
  createAttendanceBulkApproveDialogConfig,
  createAttendanceBulkRejectDialogConfig,
  createAttendanceRejectDialogConfig,
} from '../../config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import {
  IAttendanceActionRequestDto,
  IAttendanceActionResponseDto,
  IAttendanceGetBaseResponseDto,
  IAttendanceGetResponseDto,
  IAttendanceGetStatsResponseDto,
} from '../../types/attendance.dto';
import { IAttendance } from '../../types/attendance.interface';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import {
  EActionType,
  EBulkActionType,
  EDialogType,
  ERowActionType,
} from '@shared/types';
import { stringToArray } from '@shared/utility';
import { GetAttendanceDetailComponent } from '../get-attendance-detail/get-attendance-detail.component';

@Component({
  selector: 'app-get-attendance',
  imports: [DataTableComponent, PageHeaderComponent, MetricsCardComponent],
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
      message: 'Please wait while we load the attendance records...',
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

  private executeApproveRejectAction(
    formData: IAttendanceActionRequestDto,
    actionType: EActionType
  ): void {
    let title = '';
    let message = '';
    if (actionType === EActionType.APPROVED) {
      title = 'Approving Attendance';
      message = 'Please wait while we approve the attendance...';
    } else if (actionType === EActionType.REJECTED) {
      title = 'Rejecting Attendance';
      message = 'Please wait while we reject the attendance...';
    }
    this.loadingService.show({
      title,
      message,
    });

    this.attendanceService
      .actionAttendance(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceActionResponseDto) => {
          const { errors, result } = response;
          if (errors.length > 0) {
            this.notificationService.error(
              errors.map(error => error.error).join(', '),
              'Failed to execute action'
            );
          } else {
            this.notificationService.success(
              `Action executed successfully for ${result.length} attendance records`
            );
          }

          if (result.length > 0) {
            this.loadAttendanceList();
          }
        },
      });
  }

  protected handleBulkActionClick(event: IBulkActionClickEvent): void {
    this.logger.logUserAction('Bulk action clicked', event);

    const { actionType, selectedRows } = event;

    switch (actionType) {
      case EBulkActionType.APPROVE:
        this.showBulkApproveConfirmationDialog(
          selectedRows as unknown as IAttendance[]
        );
        break;
      case EBulkActionType.REJECT:
        this.showBulkRejectConfirmationDialog(
          selectedRows as unknown as IAttendance[]
        );
        break;
      default:
        this.logger.warn('Unknown bulk action:', actionType);
    }
  }

  protected handleRowActionClick(event: IRowActionClickEvent): void {
    this.logger.logUserAction('Row action clicked', event);

    const { actionType, rowData } = event;

    switch (actionType) {
      case ERowActionType.APPROVE:
        this.showSingleApproveConfirmationDialog(
          rowData as unknown as IAttendance
        );
        break;
      case ERowActionType.REJECT:
        this.showSingleRejectConfirmationDialog(
          rowData as unknown as IAttendance
        );
        break;
      case ERowActionType.REGULARIZE:
        this.showRegularizeConfirmationDialog(
          rowData as IAttendanceGetBaseResponseDto
        );
        break;
      case ERowActionType.VIEW:
        this.showAttendanceDetailsDrawer(rowData as unknown as IAttendance);
        break;
      default:
        this.logger.warn('Unknown row action:', actionType);
    }
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

  private showSingleApproveConfirmationDialog(rowData: IAttendance): void {
    this.logger.logUserAction('Single approve action triggered', rowData);

    const dialogConfig = createAttendanceApproveDialogConfig(
      rowData,
      this.onSingleApproveReject.bind(this, EActionType.APPROVED, rowData)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.APPROVE
    );
  }

  private onSingleApproveReject(
    actionType: EActionType,
    rowData: IAttendance,
    dialogFormData?: Record<string, unknown>
  ): void {
    const formData = this.prepareFormDataForSingleActionDialog(
      actionType,
      rowData,
      dialogFormData as Record<string, unknown>
    );
    this.executeApproveRejectAction(formData, actionType);
  }

  private showSingleRejectConfirmationDialog(rowData: IAttendance): void {
    this.logger.logUserAction('Single reject action triggered', rowData);

    const dialogConfig = createAttendanceRejectDialogConfig(
      rowData,
      this.onSingleApproveReject.bind(this, EActionType.REJECTED, rowData)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.REJECT
    );
  }

  private showRegularizeConfirmationDialog(
    rowData: IAttendanceGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Regularize action triggered', rowData);
  }

  private showAttendanceDetailsDrawer(rowData: IAttendance): void {
    this.logger.logUserAction('Opening attendance details drawer', rowData);

    this.drawerService.showDrawer(GetAttendanceDetailComponent, {
      header: `Attendance Details`,
      subtitle: `Detailed view of attendance`,
      componentData: {
        attendance: rowData,
      },
    });
  }

  private showBulkApproveConfirmationDialog(selectedRows: IAttendance[]): void {
    this.logger.logUserAction('Bulk approve action triggered', selectedRows);

    const dialogConfig = createAttendanceBulkApproveDialogConfig(
      selectedRows,
      this.onBulkApproveReject.bind(this, EActionType.APPROVED, selectedRows)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.APPROVE
    );
  }

  private showBulkRejectConfirmationDialog(selectedRows: IAttendance[]): void {
    this.logger.logUserAction('Bulk reject action triggered', selectedRows);

    const dialogConfig = createAttendanceBulkRejectDialogConfig(
      selectedRows,
      this.onBulkApproveReject.bind(this, EActionType.REJECTED, selectedRows)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.REJECT
    );
  }

  private onBulkApproveReject(
    actionType: EActionType,
    selectedRows: IAttendance[],
    dialogFormData?: Record<string, unknown>
  ): void {
    const formData = this.prepareFormDataForBulkActionDialog(
      actionType,
      selectedRows,
      dialogFormData as Record<string, unknown>
    );
    this.executeApproveRejectAction(formData, actionType);
  }

  protected onAddButtonClick(): void {
    const navigationRoute = [
      ROUTE_BASE_PATHS.ATTENDANCE,
      ROUTES.ATTENDANCE.APPLY,
    ];

    if (navigationRoute) {
      const success =
        void this.routerNavigationService.navigateToRoute(navigationRoute);

      if (!success) {
        this.logger.logUserAction(
          'Navigation failed for add button',
          navigationRoute
        );
      }
    } else {
      this.logger.logUserAction(
        'Add button clicked - no matching route found',
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

  private prepareFormDataForSingleActionDialog(
    actionType: EActionType,
    rowData: IAttendance,
    dialogFormData: Record<string, unknown>
  ): IAttendanceActionRequestDto {
    const { id } = rowData;
    let reason = '';
    if (actionType === EActionType.APPROVED) {
      const { approveReason } = dialogFormData as Record<string, string>;
      reason = approveReason;
    } else if (actionType === EActionType.REJECTED) {
      const { rejectReason } = dialogFormData as Record<string, string>;
      reason = rejectReason;
    }
    return {
      approvals: [
        {
          attendanceId: id,
          approvalStatus: actionType,
          approvalComment: reason,
        },
      ],
    };
  }

  private prepareFormDataForBulkActionDialog(
    actionType: EActionType,
    selectedRows: IAttendance[],
    dialogFormData: Record<string, unknown>
  ): IAttendanceActionRequestDto {
    let reason = '';
    if (actionType === EActionType.APPROVED) {
      const { approveReason } = dialogFormData as Record<string, string>;
      reason = approveReason;
    } else if (actionType === EActionType.REJECTED) {
      const { rejectReason } = dialogFormData as Record<string, string>;
      reason = rejectReason;
    }
    return {
      approvals: selectedRows.map(row => ({
        attendanceId: row.id,
        approvalStatus: actionType,
        approvalComment: reason,
      })),
    };
  }
}
