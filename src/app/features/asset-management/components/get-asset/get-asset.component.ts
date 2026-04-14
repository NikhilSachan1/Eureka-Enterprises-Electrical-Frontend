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
  createAssetTableEnhancedConfig,
  SEARCH_FILTER_ASSET_FORM_CONFIG,
} from '@features/asset-management/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetGetBaseResponseDto,
  IAssetGetFormDto,
  IAssetGetResponseDto,
  IAssetGetStatsResponseDto,
} from '@features/asset-management/types/asset.dto';
import { IAsset } from '@features/asset-management/types/asset.interface';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  GalleryService,
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
  IGalleryInputData,
  IMetricGroup,
  IPageHeaderConfig,
  ETableActionTypeValue,
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
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-asset',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    StatusTagComponent,
  ],
  templateUrl: './get-asset.component.html',
  styleUrl: './get-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAssetComponent implements OnInit {
  protected readonly ICONS = ICONS;

  private readonly allowedLatestEventTypes = new Set<string>([
    ETableActionTypeValue.HANDOVER_ACCEPTED,
    ETableActionTypeValue.HANDOVER_CANCELLED,
    ETableActionTypeValue.HANDOVER_INITIATED,
    ETableActionTypeValue.HANDOVER_REJECTED,
  ]);

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
  private readonly authService = inject(AuthService);
  private readonly galleryService = inject(GalleryService);

  protected table!: IEnhancedTable;
  protected readonly HANDOVER_EVENT_TYPES = ETableActionTypeValue;

  private static readonly HANDOVER_DIALOG_ACTIONS = new Set<EButtonActionType>([
    EButtonActionType.HANDOVER_INITIATE,
    EButtonActionType.HANDOVER_ACCEPTED,
    EButtonActionType.HANDOVER_REJECTED,
    EButtonActionType.HANDOVER_CANCELLED,
    EButtonActionType.DEALLOCATE,
  ]);
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly assetStats = signal<IAssetGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createAssetTableEnhancedConfig(loggedInUserId)
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
          const { records, stats, totalRecords } = response;

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

  private prepareParamData(): IAssetGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IAssetGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IAssetGetBaseResponseDto[]): IAsset[] {
    return response.map((record: IAssetGetBaseResponseDto) => {
      const latestEvent = record.latestEvent
        ? {
            ...record.latestEvent,
            eventTypeCode: record.latestEvent.eventType,
            eventType: this.allowedLatestEventTypes.has(
              record.latestEvent.eventType
            )
              ? getMappedValueFromArrayOfObjects(
                  this.appConfigurationService.assetEventStatuses(),
                  record.latestEvent.eventType
                )
              : '',
            fromUserName: record.latestEvent.fromUserUser
              ? `${record.latestEvent.fromUserUser.firstName} ${record.latestEvent.fromUserUser.lastName}`
              : '-',
            toUserName: record.latestEvent.toUserUser
              ? `${record.latestEvent.toUserUser.firstName} ${record.latestEvent.toUserUser.lastName}`
              : '-',
          }
        : null;

      return {
        id: record.id,
        assetId: record.assetId,
        name: record.name,
        category: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetCategories(),
          record.category
        ),
        assetAssigneeName: record.assignedToUser
          ? `${record.assignedToUser.firstName} ${record.assignedToUser.lastName}`
          : null,
        assetAssigneeCode: record.assignedToUser?.employeeId ?? null,
        calibrationFrom: record.calibrationFrom
          ? getMappedValueFromArrayOfObjects(
              this.appConfigurationService.assetCalibrationSources(),
              record.calibrationFrom
            )
          : '-',
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
        assetDocuments: record.documentKeys,
        latestEvent,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadAssetList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.assetStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'overview',
        title: 'Overview',
        metrics: [
          { label: 'Total', value: stats.total },
          { label: 'Available', value: stats.byStatus.available },
          { label: 'Assigned', value: stats.byStatus.assigned },
        ],
      },
      {
        id: 'asset-type',
        title: 'Asset Type',
        metrics: [
          { label: 'Calibrated Assets', value: stats.byAssetType.calibrated },
          {
            label: 'Non Calibrated Assets',
            value: stats.byAssetType.nonCalibrated,
          },
        ],
      },
      {
        id: 'calibration',
        title: 'Calibration',
        metrics: [
          {
            label: 'Calibration Expiring Soon',
            value: stats.calibration.expiringSoon,
          },
          { label: 'Calibration Expired', value: stats.calibration.expired },
        ],
      },
      {
        id: 'warranty',
        title: 'Warranty',
        metrics: [
          {
            label: 'Warranty Expiring Soon',
            value: stats.warranty.expiringSoon,
          },
          { label: 'Warranty Expired', value: stats.warranty.expired },
        ],
      },
    ];
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

    if (actionType === EButtonActionType.EVENT_HISTORY) {
      this.navigateToEventHistory(selectedFirstRow.id);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadAssetList();
      },
    };

    if (
      actionType === EButtonActionType.HANDOVER_INITIATE ||
      actionType === EButtonActionType.HANDOVER_ACCEPTED ||
      actionType === EButtonActionType.HANDOVER_REJECTED ||
      actionType === EButtonActionType.HANDOVER_CANCELLED ||
      actionType === EButtonActionType.DEALLOCATE
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareAssetRecordDetail(
      selectedFirstRow,
      actionType
    );

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
    selectedRow: IAssetGetBaseResponseDto,
    actionType: EButtonActionType
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
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.assetCategories(),
          selectedRow.category
        ),
      },
    ];

    if (
      GetAssetComponent.HANDOVER_DIALOG_ACTIONS.has(actionType) &&
      actionType !== EButtonActionType.HANDOVER_INITIATE
    ) {
      const eventFileKeys = this.getLatestEventFileKeys(selectedRow);
      if (eventFileKeys.length > 0) {
        entryData.push({
          label: 'Handover attachments',
          value: eventFileKeys,
          type: EDataType.ATTACHMENTS,
        });
      }
    }

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

  private getLatestEventFileKeys(row: IAssetGetBaseResponseDto): string[] {
    const files = row.latestEvent?.assetFiles;
    if (!files?.length) {
      return [];
    }
    return files
      .map(f => f.fileKey)
      .filter((k): k is string => typeof k === 'string' && k.length > 0);
  }

  protected getLatestEventFileKeysForRow(row: unknown): string[] {
    const r = row as IAsset & { originalRawData?: IAssetGetBaseResponseDto };
    if (r?.originalRawData) {
      return this.getLatestEventFileKeys(r.originalRawData);
    }
    return this.getLatestEventFileKeys(row as IAssetGetBaseResponseDto);
  }

  protected openLatestEventAttachmentsGallery(
    event: Event,
    row: unknown
  ): void {
    event.stopPropagation();
    const keys = this.getLatestEventFileKeysForRow(row);
    if (keys.length === 0) {
      return;
    }
    const media: IGalleryInputData[] = keys.map(key => ({
      mediaKey: key,
      actualMediaUrl: '',
    }));
    this.galleryService.show(media);
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

  private navigateToEventHistory(assetId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.ASSET,
        ROUTES.ASSET.EVENT_HISTORY,
      ];

      void this.routerNavigationService.navigateWithState(routeSegments, {
        assetId,
      });
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while viewing event history',
        error
      );
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
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Asset',
          actionName: 'addAsset',
          permission: [APP_PERMISSION.ASSET.ADD],
        },
      ],
    };
  }
}
