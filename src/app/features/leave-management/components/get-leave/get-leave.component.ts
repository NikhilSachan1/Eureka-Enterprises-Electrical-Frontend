import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  NotificationService,
  TableService,
} from '@shared/services';
import { LeaveService } from '@features/leave-management/services/leave.service';
import { LoggerService } from '@core/services';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IConfirmationDialogConfig,
  IConfirmationDialogRecordDetailConfig,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  EDialogType,
  EButtonActionType,
} from '@shared/types';
import {
  ILeaveActionRequestDto,
  ILeaveActionResponseDto,
  ILeaveGetBaseResponseDto,
  ILeaveGetRequestDto,
  ILeaveGetResponseDto,
  ILeaveGetStatsResponseDto,
} from '@features/leave-management/types/leave.dto';
import {
  createLeaveDialogConfig,
  LEAVE_TABLE_ENHANCED_CONFIG,
  LEAVE_TABLE_STATE_MAPPING,
  SEARCH_FILTER_LEAVE_FORM_CONFIG,
} from '@features/leave-management/config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { buildTableDataWithUnifiedMapping } from '@shared/utility/component.util';
import { ICONS } from '@shared/constants';
import { FinancialYearService } from '@core/services/financial-year.service';
import { ILeave } from '@features/leave-management/types/leave.interface';
import { APP_CONFIG } from '@core/config';
import { DatePipe } from '@angular/common';
import { GetLeaveDetailComponent } from '../get-leave-detail/get-leave-detail.component';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';

@Component({
  selector: 'app-get-leave',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  providers: [DatePipe],
  templateUrl: './get-leave.component.html',
  styleUrl: './get-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetLeaveComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly leaveServive = inject(LeaveService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly notificationService = inject(NotificationService);
  private readonly datePipe = inject(DatePipe);
  private readonly financialYearService = inject(FinancialYearService);
  private readonly drawerService = inject(DrawerService);

  protected table!: IEnhancedTable;
  protected searchFilterConfig = SEARCH_FILTER_LEAVE_FORM_CONFIG;
  private currentTableState: TableLazyLoadEvent | null = null;

  private readonly leaveStats = signal<ILeaveGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      LEAVE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
  }

  private loadLeaveList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Leave Requests',
      message: 'Please wait while we load the leave requests...',
    });

    const requestData = this.currentTableState
      ? this.prepareParamData(this.currentTableState)
      : undefined;

    this.leaveServive
      .getLeaveList(requestData)
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
          this.logger.logUserAction('Leave requests loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.leaveStats.set(null);
          this.logger.logUserAction('Failed to load leave requests', error);
        },
      });
  }

  private mapTableData(
    response: ILeaveGetBaseResponseDto[]
  ): Partial<ILeave>[] {
    return response.map((record: ILeaveGetBaseResponseDto) => ({
      id: record.id,
      fromDate: record.fromDate,
      toDate: record.toDate,
      reason: record.reason,
      approvalStatus: record.approvalStatus,
      approvalAt: record.approvalAt ?? null,
      approvalReason: record.approvalReason ?? null,
      createdAt: record.createdAt,
      createdBy: record.createdBy,
      updatedAt: record.updatedAt,
      approvalByUser: record.approvalByUser
        ? `${record.approvalByUser?.firstName} ${record.approvalByUser?.lastName}`
        : undefined,
      createdByUser: `${record.createdByUser.firstName} ${record.createdByUser.lastName}`,
      employeeName: `${record.user.firstName} ${record.user.lastName}`,
      employeeCode: record.user.employeeId,
      leaveApplicationType: record.leaveApplicationType,
    }));
  }

  protected onTableStateChange(filterData: TableLazyLoadEvent): void {
    this.currentTableState = filterData;
    this.loadLeaveList();
  }

  private prepareParamData(
    filterData: TableLazyLoadEvent
  ): ILeaveGetRequestDto {
    const finalFilterData =
      buildTableDataWithUnifiedMapping<ILeaveGetRequestDto>(
        filterData,
        LEAVE_TABLE_STATE_MAPPING
      ) as ILeaveGetRequestDto;
    return {
      ...finalFilterData,
      financialYear: this.financialYearService.financialYear,
    };
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.leaveStats();
    if (!stats) {
      return [];
    }

    return [
      { label: 'Total', value: stats.approval.total },
      { label: 'Approved', value: stats.approval.approved },
      { label: 'Pending', value: stats.approval.pending },
      { label: 'Rejected', value: stats.approval.rejected },
      { label: 'Cancelled', value: stats.approval.cancelled },
    ];
  }

  protected handleLeaveTableActionClick(
    event: ITableActionClickEvent<ILeave>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;

    switch (actionType) {
      case EButtonActionType.APPROVE:
      case EButtonActionType.REJECT:
      case EButtonActionType.CANCEL:
        this.showLeaveActionDialog(actionType, selectedRows, isBulk);
        break;

      case EButtonActionType.VIEW:
        this.showLeaveDetailsDrawer(selectedRows);
        break;

      default:
        this.logger.warn('Unknown table action:', actionType);
    }
  }

  private showLeaveActionDialog(
    actionType: EButtonActionType,
    selectedRows: ILeave[],
    isBulk: boolean
  ): void {
    let dialogConfig = {} as IConfirmationDialogConfig;

    switch (actionType) {
      case EButtonActionType.APPROVE:
      case EButtonActionType.REJECT:
      case EButtonActionType.CANCEL: {
        const recordDetail = this.prepareLeaveRecordDetail(selectedRows);
        dialogConfig = createLeaveDialogConfig(
          actionType,
          recordDetail,
          isBulk,
          !isBulk,
          this.onLeaveApprovalAction.bind(this, actionType, selectedRows)
        );
        break;
      }
      default:
        this.logger.warn('Unknown action type:', actionType);
    }

    let dialogType = EDialogType.DEFAULT;

    if (actionType === EButtonActionType.APPROVE) {
      dialogType = EDialogType.APPROVE;
    } else if (actionType === EButtonActionType.REJECT) {
      dialogType = EDialogType.REJECT;
    } else if (actionType === EButtonActionType.CANCEL) {
      dialogType = EDialogType.CANCEL;
    }

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      dialogType
    );
  }

  private onLeaveApprovalAction(
    actionType: EButtonActionType,
    selectedRows: ILeave[],
    dialogFormData?: Record<string, string>
  ): void {
    const formData = this.prepareLeaveApprovalFormData(
      actionType,
      selectedRows,
      dialogFormData
    );

    this.executeLeaveApprovalAction(formData, actionType);
  }

  private prepareLeaveApprovalFormData(
    actionType: EButtonActionType,
    selectedRows: ILeave[],
    dialogFormData?: Record<string, string>
  ): ILeaveActionRequestDto {
    const { comment, attendanceStatus } = dialogFormData as {
      comment: string;
      attendanceStatus: EAttendanceStatus;
    };
    let actionTypeValue = EButtonActionType.APPROVE;

    if (actionType === EButtonActionType.APPROVE) {
      actionTypeValue = EButtonActionType.APPROVE;
    } else if (actionType === EButtonActionType.REJECT) {
      actionTypeValue = EButtonActionType.REJECT;
    } else if (actionType === EButtonActionType.CANCEL) {
      actionTypeValue = EButtonActionType.CANCEL;
    }

    const leaveActualDate = new Date(selectedRows[0].fromDate);
    const isDateIsEarlier = leaveActualDate <= new Date();
    let attendanceStatusValue = EAttendanceStatus.LEAVE;

    if (isDateIsEarlier && actionType === EButtonActionType.APPROVE) {
      attendanceStatusValue = EAttendanceStatus.LEAVE;
    } else {
      attendanceStatusValue = attendanceStatus;
    }

    return {
      approvals: selectedRows.map(row => ({
        leaveApplicationId: row.id,
        attendanceStatus: attendanceStatusValue,
        approvalStatus: actionTypeValue,
        approvalComment: comment,
      })),
    };
  }

  private executeLeaveApprovalAction(
    formData: ILeaveActionRequestDto,
    actionType: EButtonActionType
  ): void {
    let loadingMessage;

    if (actionType === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Leave',
        message: 'Please wait while we approve the leave...',
      };
    } else if (actionType === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Leave',
        message: 'Please wait while we reject the leave...',
      };
    } else if (actionType === EButtonActionType.CANCEL) {
      loadingMessage = {
        title: 'Cancelling Leave',
        message: 'Please wait while we cancel the leave...',
      };
    }

    this.loadingService.show(loadingMessage);

    this.leaveServive
      .actionLeave(formData)
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILeaveActionResponseDto) => {
          const { errors, result } = response;
          const hasErrors = errors.length > 0;
          const hasResult = result.length > 0;
          const errorCount = errors.length;
          const resultCount = result.length;
          const recordsCount = result.length + errors.length;

          if (hasErrors && hasResult) {
            if (recordsCount === 1) {
              this.notificationService.error(`Failed to ${actionType} leave`);
            } else {
              this.notificationService.error(
                `Failed to ${actionType} leave for ${errorCount} records and executed successfully for ${resultCount} records`
              );
            }
          } else if (hasErrors) {
            if (recordsCount === 1) {
              this.notificationService.error(`Failed to ${actionType} leave`);
            } else {
              this.notificationService.error(
                `Failed to ${actionType} leave for ${errorCount} records`
              );
            }
          } else if (hasResult) {
            if (recordsCount === 1) {
              this.notificationService.success(
                `Successfully ${actionType} leave`
              );
            } else {
              this.notificationService.success(
                `Successfully ${actionType} leave for ${resultCount} records`
              );
            }
          }

          if (hasResult) {
            this.loadLeaveList();
          }
        },
      });
  }

  private prepareLeaveRecordDetail(
    selectedRows: ILeave[]
  ): IConfirmationDialogRecordDetailConfig {
    const [firstRow] = selectedRows;

    const fromDate = this.datePipe.transform(
      firstRow.fromDate,
      APP_CONFIG.DATE_FORMATS.DEFAULT
    ) as string;
    const toDate = this.datePipe.transform(
      firstRow.toDate,
      APP_CONFIG.DATE_FORMATS.DEFAULT
    ) as string;

    const recordDetail = [
      { label: 'Employee Name', value: firstRow.employeeName },
      {
        label: 'Leave Date',
        value: `${fromDate} - ${toDate}`,
      },
      { label: 'Leave Status', value: firstRow.approvalStatus },
      {
        label: 'Leave Reason',
        value: firstRow.reason,
      },
    ];
    return {
      details: recordDetail,
    };
  }

  private showLeaveDetailsDrawer(rowData: ILeave[]): void {
    this.logger.logUserAction('Opening leave details drawer', rowData);

    this.drawerService.showDrawer(GetLeaveDetailComponent, {
      header: `Leave Details`,
      subtitle: `Detailed view of leave`,
      componentData: {
        leave: rowData[0],
      },
    });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Leave Management',
      subtitle: 'Manage leave requests',
      showHeaderButton: true,
      headerButtonConfig: {
        label: 'Apply Leave',
        icon: ICONS.COMMON.PLUS,
      },
    };
  }
}
