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
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetricGroup,
  IPageHeaderConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IVehicleEventHistoryGetBaseResponseDto,
  IVehicleEventHistoryGetFormDto,
  IVehicleEventHistoryGetResponseDto,
  IVehicleEventHistoryGetStatsResponseDto,
} from '../../types/vehicle.dto';
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
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';

@Component({
  selector: 'app-get-vehicle-event-history',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    EmptyMessagesComponent,
  ],
  templateUrl: './get-vehicle-event-history.component.html',
  styleUrl: './get-vehicle-event-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleEventHistoryComponent implements OnInit {
  protected readonly ICONS = ICONS;
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vehicleService = inject(VehicleService);
  private readonly loadingService = inject(LoadingService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly vehicleEventHistoryStats =
    signal<IVehicleEventHistoryGetStatsResponseDto | null>(null);
  private readonly vehicleId = signal<string>('');
  protected readonly hasVehicleSelected = computed(() => !!this.vehicleId());
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());
  protected prefillValues = signal<Record<string, unknown> | undefined>(
    undefined
  );

  ngOnInit(): void {
    const vehicleIdFromState =
      this.routerNavigationService.getRouterStateData<string>('vehicleId');

    if (vehicleIdFromState) {
      this.vehicleId.set(vehicleIdFromState);
      this.prefillValues.set({ vehicleName: vehicleIdFromState });
    }

    this.table = this.dataTableService.createTable(
      VEHICLE_EVENT_HISTORY_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_CONFIG;
  }

  private loadVehicleEventHistory(): void {
    if (!this.vehicleId()) {
      return;
    }

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

  private prepareParamData(): IVehicleEventHistoryGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IVehicleEventHistoryGetFormDto>(
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

  protected onFilterSubmit(filterData: Record<string, unknown>): void {
    const selectedVehicleId = filterData['vehicleName'] as string | undefined;

    if (selectedVehicleId) {
      this.vehicleId.set(selectedVehicleId);
    } else {
      this.vehicleId.set('');
      this.vehicleEventHistoryStats.set(null);
      this.table.setData([]);
    }
  }

  protected onFilterReset(): void {
    this.vehicleId.set('');
    this.vehicleEventHistoryStats.set(null);
    this.table.setData([]);
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.vehicleEventHistoryStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'status',
        title: 'Status Events',
        icon: ICONS.COMMON.CAR,
        metrics: [
          { label: 'Available', value: stats.byEventType.AVAILABLE },
          { label: 'Assigned', value: stats.byEventType.ASSIGNED },
        ],
      },
      {
        id: 'handover',
        title: 'Handover Events',
        icon: ICONS.COMMON.SYNC,
        metrics: [
          {
            label: 'Handover Initiated',
            value: stats.byEventType.HANDOVER_INITIATED,
          },
          {
            label: 'Handover Accepted',
            value: stats.byEventType.HANDOVER_ACCEPTED,
          },
          {
            label: 'Handover Rejected',
            value: stats.byEventType.HANDOVER_REJECTED,
          },
          {
            label: 'Handover Cancelled',
            value: stats.byEventType.HANDOVER_CANCELLED,
          },
          {
            label: 'Deallocated',
            value: stats.byEventType.DEALLOCATED,
          },
        ],
      },
    ];
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Vehicle Event History',
      subtitle: 'Manage vehicle event history records',
    };
  }
}
