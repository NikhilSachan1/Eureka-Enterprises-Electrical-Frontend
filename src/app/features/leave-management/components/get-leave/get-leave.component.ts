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
  LoadingService,
  NotificationService,
  RouterNavigationService,
  TableService,
} from '@shared/services';
import { LeaveService } from '@features/leave-management/services/leave.service';
import { LoggerService } from '@core/services';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
} from '@shared/models';
import {
  ILeaveGetBaseResponseDto,
  ILeaveGetRequestDto,
  ILeaveGetResponseDto,
  ILeaveGetStatsResponseDto,
} from '@features/leave-management/types/leave.dto';
import {
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
  private readonly leaveServive = inject(LeaveService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly notificationService = inject(NotificationService);
  private readonly financialYearService = inject(FinancialYearService);

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
      leaveReason: record.reason,
      approvalStatus: record.approvalStatus,
      employeeName: `${record.user.firstName} ${record.user.lastName}`,
      employeeCode: record.user.employeeId,
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
