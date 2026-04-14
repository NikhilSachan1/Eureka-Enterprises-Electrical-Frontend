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
import { LoggerService } from '@core/services';
import {
  ASSET_EVENT_HISTORY_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_CONFIG,
} from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetEventHistoryGetBaseResponseDto,
  IAssetEventHistoryGetFormDto,
  IAssetEventHistoryGetResponseDto,
  IAssetEventHistoryGetStatsResponseDto,
} from '@features/asset-management/types/asset.dto';
import { IAssetEventHistory } from '@features/asset-management/types/asset.interface';
import {
  AppConfigurationService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetricGroup,
  IPageHeaderConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-asset-event-history',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    EmptyMessagesComponent,
  ],
  templateUrl: './get-asset-event-history.component.html',
  styleUrl: './get-asset-event-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAssetEventHistoryComponent implements OnInit {
  protected readonly ICONS = ICONS;
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly assetService = inject(AssetService);
  private readonly loadingService = inject(LoadingService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly assetEventHistoryStats =
    signal<IAssetEventHistoryGetStatsResponseDto | null>(null);
  private readonly assetId = signal<string>('');
  protected readonly hasAssetSelected = computed(() => !!this.assetId());
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());
  protected prefillValues = signal<Record<string, unknown> | undefined>(
    undefined
  );

  ngOnInit(): void {
    const assetIdFromState =
      this.routerNavigationService.getRouterStateData<string>('assetId');

    if (assetIdFromState) {
      this.assetId.set(assetIdFromState);
      this.prefillValues.set({ assetName: assetIdFromState });
    }

    this.table = this.dataTableService.createTable(
      ASSET_EVENT_HISTORY_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_CONFIG;
  }

  private loadAssetList(): void {
    if (!this.assetId()) {
      return;
    }

    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Asset Event History',
      message: 'Please wait while we load the asset event history...',
    });

    const paramData = this.prepareParamData();

    this.assetService
      .getAssetEventHistory(paramData, this.assetId())
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAssetEventHistoryGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.assetEventHistoryStats.set(stats);
          this.logger.logUserAction(
            'Asset event history records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.assetEventHistoryStats.set(null);
          this.logger.logUserAction(
            'Failed to load asset event history records',
            error
          );
        },
      });
  }

  private prepareParamData(): IAssetEventHistoryGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IAssetEventHistoryGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IAssetEventHistoryGetBaseResponseDto[]
  ): IAssetEventHistory[] {
    return response.map((record: IAssetEventHistoryGetBaseResponseDto) => {
      const fromUser = record.fromUserDetails;
      const toUser = record.toUserDetails;
      const createdBy = record.createdByUser;

      return {
        eventDate: record.createdAt,
        eventType: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetEventStatuses(),
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
    this.loadAssetList();
  }

  protected onFilterSubmit(filterData: Record<string, unknown>): void {
    const selectedAssetId = filterData['assetName'] as string | undefined;

    if (selectedAssetId) {
      this.assetId.set(selectedAssetId);
    } else {
      this.assetId.set('');
      this.assetEventHistoryStats.set(null);
      this.table.setData([]);
    }
  }

  protected onFilterReset(): void {
    this.assetId.set('');
    this.assetEventHistoryStats.set(null);
    this.table.setData([]);
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.assetEventHistoryStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'status',
        title: 'Status Events',
        icon: ICONS.ASSET.BOX,
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
      title: `Asset Event History`,
      subtitle: 'Manage asset event history records',
    };
  }
}
