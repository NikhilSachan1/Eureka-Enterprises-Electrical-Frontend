import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppPermissionService, LoggerService } from '@core/services';
import {
  ASSET_ACTION_CONFIG_MAP,
  createAssetTableEnhancedConfig,
  getAssetQrDialogActionConfig,
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
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  ETabMode,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IGalleryInputData,
  IMetricGroup,
  IPageHeaderConfig,
  ITabChange,
  ITabItem,
  ETableActionTypeValue,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize, forkJoin, map } from 'rxjs';
import { GetAssetDetailComponent } from '../get-asset-detail/get-asset-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import {
  applyGroupMetricValueLoading,
  getMappedValueFromArrayOfObjects,
} from '@shared/utility';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { EAssetScope } from '@features/asset-management/types/asset.enum';

@Component({
  selector: 'app-get-asset',
  imports: [
    NgTemplateOutlet,
    PageHeaderComponent,
    MetricsCardComponent,
    NavTabsComponent,
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

  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly authService = inject(AuthService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly galleryService = inject(GalleryService);
  private readonly dataTable = viewChild(DataTableComponent);

  protected readonly assetTabMode = ETabMode.CONTENT;
  private readonly assetScopeCounts = signal<
    Partial<Record<EAssetScope, number>>
  >({});
  protected readonly assetScopeTabs = computed<ITabItem[]>(() => {
    const counts = this.assetScopeCounts();
    const ownPending = this.canSeeAssetTab(EAssetScope.MY);

    return [
      {
        route: EAssetScope.MY,
        label: 'My Assets',
        icon: ICONS.COMMON.USER,
        tooltip: 'Assets assigned to you',
        badge: counts[EAssetScope.MY],
        visible: ownPending,
      },
      {
        route: EAssetScope.ALL,
        label: 'All Assets',
        icon: ICONS.COMMON.USERS,
        tooltip: 'Every asset record',
        badge: counts[EAssetScope.ALL],
        visible: this.canSeeAssetTab(EAssetScope.ALL),
      },
      {
        route: EAssetScope.PENDING,
        label: ownPending ? 'Your Pending' : 'Handover Pending',
        icon: ICONS.ACTIONS.SEND,
        tooltip: ownPending
          ? 'Handovers waiting for you'
          : 'Assets with handover initiated',
        badge: counts[EAssetScope.PENDING],
        visible: this.canSeeAssetTab(EAssetScope.PENDING),
      },
    ];
  });

  protected readonly showAssetScopeTabs = computed(() =>
    this.assetScopeTabs().some(tab => tab.visible !== false)
  );

  /** Active tab. Filter values stay; the list reloads for the new scope. */
  protected readonly assetScope = signal<EAssetScope>(
    this.resolveDefaultAssetScope()
  );

  /** On My Assets every record is assigned to the logged-in user, so these add nothing. */
  private readonly myAssetsHiddenFilterFields = new Set([
    'assetAssignee',
    'assetStatus',
  ]);

  private readonly pendingAssetsHiddenFilterFields = new Set(['assetStatus']);

  protected readonly assetFilterVisibleFields = computed(() => {
    const hiddenFields =
      this.assetScope() === EAssetScope.MY
        ? this.myAssetsHiddenFilterFields
        : this.assetScope() === EAssetScope.PENDING
          ? this.pendingAssetsHiddenFilterFields
          : null;

    if (!hiddenFields) {
      return undefined;
    }

    return Object.keys(SEARCH_FILTER_ASSET_FORM_CONFIG.fields).filter(
      fieldName => !hiddenFields.has(fieldName)
    );
  });

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

  protected onAssetScopeTabChanged(change: ITabChange): void {
    const scope = Object.values(EAssetScope).includes(
      change.tab.route as EAssetScope
    )
      ? (change.tab.route as EAssetScope)
      : EAssetScope.ALL;

    if (scope === this.assetScope()) {
      return;
    }

    this.assetScope.set(scope);
    this.reloadForScopeChange();
  }

  private reloadForScopeChange(): void {
    if (!this.tableFilterData) {
      return;
    }

    const table = this.dataTable()?.dt();
    if (table) {
      table.first = 0;
    }

    this.tableFilterData = {
      ...this.tableFilterData,
      first: 0,
    };
    this.loadAssetList();
  }

  ngOnInit(): void {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createAssetTableEnhancedConfig(loggedInUserId)
    );
    this.searchFilterConfig = SEARCH_FILTER_ASSET_FORM_CONFIG;
    this.loadAssetScopeCounts();
  }

  private canSeeAssetTab(scope: EAssetScope): boolean {
    this.appPermissionService.getPermissions();
    const permission = {
      [EAssetScope.MY]: APP_PERMISSION.UI.ASSET.TAB_MY,
      [EAssetScope.ALL]: APP_PERMISSION.UI.ASSET.TAB_ALL,
      [EAssetScope.PENDING]: APP_PERMISSION.UI.ASSET.TAB_PENDING,
    }[scope];

    return this.appPermissionService.hasPermission(permission);
  }

  private resolveDefaultAssetScope(): EAssetScope {
    if (this.canSeeAssetTab(EAssetScope.MY)) {
      return EAssetScope.MY;
    }
    return EAssetScope.ALL;
  }

  private loadAssetScopeCounts(): void {
    const scopes = [
      EAssetScope.MY,
      EAssetScope.ALL,
      EAssetScope.PENDING,
    ].filter(scope => this.canSeeAssetTab(scope));

    if (!scopes.length) {
      return;
    }

    forkJoin(
      scopes.map(scope =>
        this.assetService.getAssetList(this.buildScopeCountParams(scope)).pipe(
          map(response => ({
            scope,
            totalRecords: response.totalRecords,
          }))
        )
      )
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(results => {
        const counts: Partial<Record<EAssetScope, number>> = {};
        for (const result of results) {
          counts[result.scope] = result.totalRecords;
        }
        this.assetScopeCounts.set(counts);
      });
  }

  private buildScopeCountParams(scope: EAssetScope): IAssetGetFormDto {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    const params: IAssetGetFormDto = { page: 1, pageSize: 1 };

    if (scope === EAssetScope.MY && loggedInUserId) {
      params.assetAssignee = loggedInUserId;
    }

    if (scope === EAssetScope.PENDING) {
      params.assetStatus = 'INITIATED';

      if (this.authService.isActiveRoleEmployeeLike() && loggedInUserId) {
        params.handoverToUser = loggedInUserId;
      }
    }

    return params;
  }

  private loadAssetList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.assetService
      .getAssetList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
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
    const params =
      this.tableServerSideFilterAndSortService.buildQueryParams<IAssetGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    if (this.assetScope() === EAssetScope.MY && loggedInUserId) {
      params.assetAssignee = loggedInUserId;
    }

    if (this.assetScope() === EAssetScope.PENDING) {
      params.assetStatus = 'INITIATED';
    }

    if (
      params.assetStatus === 'INITIATED' &&
      this.authService.isActiveRoleEmployeeLike() &&
      loggedInUserId
    ) {
      params.handoverToUser = loggedInUserId;
    }

    return params;
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
        calibrationDocuments: record.calibrationDocumentKeys,
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
    const loading = this.table.loading();

    const groups: IMetricGroup[] = [
      {
        id: 'overview',
        title: 'Overview',
        icon: ICONS.ASSET.BOX,
        metrics: [
          { label: 'Total', value: stats?.total ?? 0 },
          { label: 'Available', value: stats?.byStatus?.available ?? 0 },
          { label: 'Assigned', value: stats?.byStatus?.assigned ?? 0 },
          {
            label: 'Initiated',
            icon: ICONS.ACTIONS.SEND,
            value: stats?.handover?.initiated ?? 0,
          },
        ],
      },
      {
        id: 'asset-type',
        title: 'Asset Type',
        icon: ICONS.SETTINGS.WRENCH,
        metrics: [
          {
            label: 'Calibrated Assets',
            value: stats?.byAssetType?.calibrated ?? 0,
          },
          {
            label: 'Non Calibrated Assets',
            value: stats?.byAssetType?.nonCalibrated ?? 0,
          },
        ],
      },
      {
        id: 'validity-status',
        title: 'Validity',
        icon: ICONS.COMMON.GAUGE,
        metrics: [
          {
            label: 'Calibration Expiring Soon',
            value: stats?.calibration?.expiringSoon ?? 0,
          },
          {
            label: 'Calibration Expired',
            value: stats?.calibration?.expired ?? 0,
          },
          {
            label: 'Warranty Expiring Soon',
            value: stats?.warranty?.expiringSoon ?? 0,
          },
          { label: 'Warranty Expired', value: stats?.warranty?.expired ?? 0 },
        ],
      },
    ];

    return applyGroupMetricValueLoading(groups, loading);
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

    if (actionType === EButtonActionType.QR_CODE) {
      this.confirmationDialogService.showConfirmationDialog(
        actionType,
        getAssetQrDialogActionConfig(isBulk, selectedRows.length),
        null,
        isBulk,
        false,
        { selectedRecord: selectedRows, printOnAccept: isBulk }
      );
      return;
    }

    if (actionType === EButtonActionType.DOWNLOAD) {
      this.openExportAssetDialog(selectedRows, isBulk);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadAssetList();
        this.loadAssetScopeCounts();
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

  private openExportAssetDialog(
    selectedRows: IAssetGetBaseResponseDto[],
    isBulk: boolean
  ): void {
    const [selectedFirstRow] = selectedRows;

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.DOWNLOAD,
      ASSET_ACTION_CONFIG_MAP[EButtonActionType.DOWNLOAD],
      isBulk
        ? null
        : this.prepareAssetRecordDetail(
          selectedFirstRow,
          EButtonActionType.DOWNLOAD
        ),
      isBulk,
      !isBulk,
      {
        selectedRecord: selectedRows,
      }
    );
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
