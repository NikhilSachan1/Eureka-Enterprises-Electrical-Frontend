import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import {
  ASSET_ACTION_CONFIG_MAP,
  ASSET_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_ASSET_FORM_CONFIG,
} from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetGetBaseResponseDto,
  IAssetGetRequestDto,
  IAssetGetResponseDto,
  IAssetGetStatsResponseDto,
} from '@features/asset-management/types/asset.dto';
import { IAsset } from '@features/asset-management/types/asset.interface';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { GetAssetDetailComponent } from '../get-asset-detail/get-asset-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-asset',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-asset.component.html',
  styleUrl: './get-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAssetComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly assetService = inject(AssetService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly assetStats = signal<IAssetGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      ASSET_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_ASSET_FORM_CONFIG;
  }

  private loadAssetList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Asset',
      message: 'Please wait while we load the asset...',
    });

    const paramData = this.prepareParamData();

    this.assetService
      .getAssetList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAssetGetResponseDto) => {
          const { records, stats = {}, totalRecords } = response; // TODO: remove optional chaining from stats

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.assetStats.set(stats);
          this.logger.logUserAction('Asset records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.assetStats.set(null);
          this.logger.logUserAction('Failed to load asset records', error);
        },
      });
  }

  private prepareParamData(): IAssetGetRequestDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IAssetGetRequestDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IAssetGetBaseResponseDto[]): IAsset[] {
    return response.map((record: IAssetGetBaseResponseDto) => {
      return {
        id: record.id,
        assetId: record.assetId,
        name: record.name,
        category: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetCategories(),
          record.category
        ),
        calibrationFrom: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetCalibrationSources(),
          record.calibrationFrom
        ),
        calibrationStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetCalibrationStatuses(),
          record.calibrationStatus
        ),
        warrantyStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetWarrantyStatuses(),
          record.warrantyStatus
        ),
        status: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetStatuses(),
          record.status
        ),
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadAssetList();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.assetStats();
    if (!stats) {
      return [];
    }

    return [];
  }

  protected handleAssetTableActionClick(
    event: ITableActionClickEvent<IAssetGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showAssetDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditAsset(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadAssetList();
      },
    };

    const recordDetail = this.prepareAssetRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      ASSET_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareAssetRecordDetail(
    selectedRow: IAssetGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Model',
        value: selectedRow.model,
      },
      {
        label: 'Serial Number',
        value: selectedRow.serialNumber,
      },
      {
        label: 'Category',
        value: selectedRow.category,
      },
      {
        label: 'Asset Status',
        type: EDataType.STATUS,
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetStatuses(),
          selectedRow.status
        ),
      },
    ];
    return {
      details: [
        {
          status: {
            approvalStatus: selectedRow.status,
          },
          entryData,
        },
      ],
      entity: {
        name: selectedRow.name,
        subtitle: selectedRow.assetId,
      },
    };
  }

  private showAssetDetailsDrawer(rowData: IAssetGetBaseResponseDto): void {
    this.logger.logUserAction('Opening asset details drawer', rowData);

    this.drawerService.showDrawer(GetAssetDetailComponent, {
      header: `Asset Details`,
      subtitle: `Detailed view of asset`,
      componentData: {
        asset: rowData,
      },
    });
  }

  private navigateToEditAsset(assetId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.ASSET,
        ROUTES.ASSET.EDIT,
        assetId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction('Navigation error while editing asset', error);
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addAsset') {
      navigationRoute = [ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.ADD];
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
      title: 'Asset Management',
      subtitle: 'Manage asset records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          label: 'Add Asset',
          icon: ICONS.COMMON.PLUS,
          actionName: 'addAsset',
        },
      ],
    };
  }
}
