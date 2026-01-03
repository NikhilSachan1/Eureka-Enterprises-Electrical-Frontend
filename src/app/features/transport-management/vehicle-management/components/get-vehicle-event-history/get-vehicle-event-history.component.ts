import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  AppConfigurationService,
  LoadingService,
  NotificationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import { ActivatedRoute } from '@angular/router';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IVehicleEventHistoryGetBaseResponseDto,
  IVehicleEventHistoryGetRequestDto,
  IVehicleEventHistoryGetResponseDto,
  IVehicleEventHistoryGetStatsResponseDto,
} from '../../types/vehicle.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_CONFIG,
  VEHICLE_EVENT_HISTORY_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { IVehicleEventHistory } from '../../types/vehicle.interface';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';

@Component({
  selector: 'app-get-vehicle-event-history',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-vehicle-event-history.component.html',
  styleUrl: './get-vehicle-event-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleEventHistoryComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vehicleService = inject(VehicleService);
  private readonly loadingService = inject(LoadingService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly vehicleEventHistoryStats =
    signal<IVehicleEventHistoryGetStatsResponseDto | null>(null);
  private readonly vehicleId = signal<string>('');
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());
  protected vehicleDetails = signal<
    IVehicleEventHistoryGetResponseDto['records'][number]['vehicle'] | null
  >(null);
  ngOnInit(): void {
    const vehicleId = this.activatedRoute.snapshot.params[
      'vehicleId'
    ] as string;
    if (!vehicleId) {
      this.logger.logUserAction('No vehicle id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.vehicleId.set(vehicleId);

    this.table = this.dataTableService.createTable(
      VEHICLE_EVENT_HISTORY_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_CONFIG;
  }

  private loadVehicleEventHistory(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Vehicle Event History',
      message: 'Please wait while we load the vehicle event history...',
    });

    const paramData = this.prepareParamData();

    this.vehicleService
      .getVehicleEventHistory(paramData, this.vehicleId())
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleEventHistoryGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.vehicleDetails.set(records[0].vehicle);
          this.table.updateTableConfig({ totalRecords });
          this.vehicleEventHistoryStats.set(stats);
          this.logger.logUserAction(
            'Vehicle event history records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.vehicleEventHistoryStats.set(null);
          this.logger.logUserAction(
            'Failed to load vehicle event history records',
            error
          );
        },
      });
  }

  private prepareParamData(): IVehicleEventHistoryGetRequestDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IVehicleEventHistoryGetRequestDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IVehicleEventHistoryGetBaseResponseDto[]
  ): IVehicleEventHistory[] {
    return response.map((record: IVehicleEventHistoryGetBaseResponseDto) => {
      const fromUser = record.fromUserDetails;
      const toUser = record.toUserDetails;
      const createdBy = record.createdByUser;

      return {
        eventDate: record.createdAt,
        eventType: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleEventStatuses(),
          record.eventType
        ),
        remarks: record?.metadata?.['remark'] ?? '-',
        createdAt: record.createdAt,
        documentKeys: record.documentKeys,
        fromUserName: fromUser
          ? `${fromUser.firstName} ${fromUser.lastName}`
          : null,
        fromUserCode: fromUser?.employeeId ?? null,
        toUserName: toUser ? `${toUser.firstName} ${toUser.lastName}` : null,
        toUserCode: toUser?.employeeId ?? null,
        createdByName: `${createdBy.firstName} ${createdBy.lastName}`,
        createdByCode: createdBy.employeeId,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVehicleEventHistory();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.vehicleEventHistoryStats();
    if (!stats) {
      return [];
    }

    return [
      {
        label: 'Total Events',
        value: stats.total,
      },
      {
        label: 'Times Marked Available',
        value: stats.byEventType.AVAILABLE,
      },
      {
        label: 'Times Marked Assigned',
        value: stats.byEventType.ASSIGNED,
      },
      {
        label: 'Times Marked Deallocated',
        value: stats.byEventType.DEALLOCATED,
      },
      {
        label: 'Times Marked Updated',
        value: stats.byEventType.UPDATED,
      },
      {
        label: 'Times Marked Handover Initiated',
        value: stats.byEventType.HANDOVER_INITIATED,
      },
      {
        label: 'Times Marked Handover Accepted',
        value: stats.byEventType.HANDOVER_ACCEPTED,
      },
      {
        label: 'Times Marked Handover Rejected',
        value: stats.byEventType.HANDOVER_REJECTED,
      },
      {
        label: 'Times Marked Handover Cancelled',
        value: stats.byEventType.HANDOVER_CANCELLED,
      },
    ];
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: `Vehicle Event History - ${this.vehicleDetails()?.registrationNo}`,
      subtitle: 'Manage vehicle event history records',
    };
  }
}
