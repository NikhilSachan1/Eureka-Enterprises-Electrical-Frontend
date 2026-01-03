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
  IAssetEventHistoryGetRequestDto,
  IAssetEventHistoryGetResponseDto,
  IAssetEventHistoryGetStatsResponseDto,
} from '@features/asset-management/types/asset.dto';
import { IAssetEventHistory } from '@features/asset-management/types/asset.interface';
import {
  AppConfigurationService,
  LoadingService,
  NotificationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ActivatedRoute } from '@angular/router';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-asset-event-history',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-asset-event-history.component.html',
  styleUrl: './get-asset-event-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAssetEventHistoryComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly assetService = inject(AssetService);
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
  private readonly assetEventHistoryStats =
    signal<IAssetEventHistoryGetStatsResponseDto | null>(null);
  private readonly assetId = signal<string>('');
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());
  protected assetDetails = signal<
    IAssetEventHistoryGetResponseDto['records'][number]['asset'] | null
  >(null);

  ngOnInit(): void {
    const assetId = this.activatedRoute.snapshot.params['assetId'] as string;
    if (!assetId) {
      this.logger.logUserAction('No asset id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.assetId.set(assetId);

    this.table = this.dataTableService.createTable(
      ASSET_EVENT_HISTORY_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_CONFIG;
  }

  private loadAssetList(): void {
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
          this.assetDetails.set(records[0].asset);
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

  private prepareParamData(): IAssetEventHistoryGetRequestDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IAssetEventHistoryGetRequestDto>(
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

  private getMetricCardsData(): IMetric[] {
    const stats = this.assetEventHistoryStats();
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
      title: `Asset Event History - ${this.assetDetails()?.name}`,
      subtitle: 'Manage asset event history records',
    };
  }
}
