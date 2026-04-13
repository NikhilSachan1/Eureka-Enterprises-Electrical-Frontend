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
  ConfirmationDialogService,
  DrawerService,
  GalleryService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import {
  EButtonActionType,
  EDataType,
  ETableActionTypeValue,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IGalleryInputData,
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IVehicleGetBaseResponseDto,
  IvehicleGetFormDto,
  IVehicleGetResponseDto,
  IVehicleGetStatsResponseDto,
} from '../../types/vehicle.dto';
import {
  createVehicleTableEnhancedConfig,
  SEARCH_FILTER_VEHICLE_FORM_CONFIG,
  VEHICLE_ACTION_CONFIG_MAP,
} from '../../config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IVehicle } from '../../types/vehicle.interface';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { GetVehicleDetailComponent } from '../get-vehicle-detail/get-vehicle-detail.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { APP_CONFIG } from '@core/config';
import { DatePipe, DecimalPipe } from '@angular/common';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';

@Component({
  selector: 'app-get-vehicle',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    DatePipe,
    DecimalPipe,
    StatusTagComponent,
  ],
  templateUrl: './get-vehicle.component.html',
  styleUrl: './get-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleComponent implements OnInit {
  private readonly allowedLatestEventTypes = new Set<string>([
    ETableActionTypeValue.HANDOVER_ACCEPTED,
    ETableActionTypeValue.HANDOVER_CANCELLED,
    ETableActionTypeValue.HANDOVER_INITIATED,
    ETableActionTypeValue.HANDOVER_REJECTED,
  ]);

  protected readonly HANDOVER_EVENT_TYPES = ETableActionTypeValue;

  private static readonly HANDOVER_DIALOG_ACTIONS = new Set<EButtonActionType>([
    EButtonActionType.HANDOVER_INITIATE,
    EButtonActionType.HANDOVER_ACCEPTED,
    EButtonActionType.HANDOVER_REJECTED,
    EButtonActionType.HANDOVER_CANCELLED,
    EButtonActionType.DEALLOCATE,
  ]);

  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vehicleService = inject(VehicleService);
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
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly vehicleStats = signal<IVehicleGetStatsResponseDto | null>(
    null
  );

  protected readonly ALL_APP_CONFIG = APP_CONFIG;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createVehicleTableEnhancedConfig(loggedInUserId)
    );
    this.searchFilterConfig = SEARCH_FILTER_VEHICLE_FORM_CONFIG;
  }

  private loadVehicleList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Vehicle',
      message: 'Please wait while we load the vehicle...',
    });

    const paramData = this.prepareParamData();

    this.vehicleService
      .getVehicleList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.vehicleStats.set(stats);
          this.logger.logUserAction('Vehicle records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.vehicleStats.set(null);
          this.logger.logUserAction('Failed to load vehicle records', error);
        },
      });
  }

  private prepareParamData(): IvehicleGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IvehicleGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IVehicleGetBaseResponseDto[]): IVehicle[] {
    return response.map((record: IVehicleGetBaseResponseDto) => {
      const latestEvent = record.latestEvent
        ? {
            ...record.latestEvent,
            eventTypeCode: record.latestEvent.eventType,
            eventType: this.allowedLatestEventTypes.has(
              record.latestEvent.eventType
            )
              ? getMappedValueFromArrayOfObjects(
                  this.appConfigurationService.vehicleEventStatuses(),
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
        vehicleNumber: record.registrationNo,
        vehicleName: `${record.brand} ${record.model}`,
        status: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleStatuses(),
          record.status
        ),
        vehicleAssigneeName: record.assignedToUser
          ? `${record.assignedToUser.firstName} ${record.assignedToUser.lastName}`
          : null,
        vehicleAssigneeCode: record.assignedToUser?.employeeId ?? null,
        vehicleDocuments: record.documentKeys,
        insuranceStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleDocumentStatuses(),
          record.insuranceStatus
        ),
        pucStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleDocumentStatuses(),
          record.pucStatus
        ),
        serviceStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleServiceStatuses(),
          record.serviceDueStatus
        ),
        petroCardNumber: record.associatedCard?.cardNumber ?? null,
        petroCardName: record.associatedCard?.cardName ?? null,
        latestEvent,
        originalRawData: record,
      } satisfies IVehicle;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVehicleList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.vehicleStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'vehicle-overview',
        title: 'Vehicle Overview',
        icon: 'pi pi-car',
        metrics: [
          { label: 'Total', value: stats.total },
          { label: 'Available', value: stats.byStatus.available },
          { label: 'Assigned', value: stats.byStatus.assigned },
        ],
      },
      {
        id: 'puc-status',
        title: 'PUC Status',
        icon: 'pi pi-file',
        metrics: [
          { label: 'PUC Expiring Soon', value: stats.pucStatus.expiringSoon },
          { label: 'PUC Expired', value: stats.pucStatus.expired },
        ],
      },
      {
        id: 'insurance-status',
        title: 'Insurance Status',
        icon: 'pi pi-shield',
        metrics: [
          {
            label: 'Insurance Expiring Soon',
            value: stats.insuranceStatus.expiringSoon,
          },
          { label: 'Insurance Expired', value: stats.insuranceStatus.expired },
        ],
      },
      {
        id: 'service-status',
        title: 'Service Status',
        icon: 'pi pi-wrench',
        metrics: [
          { label: 'Service Due Soon', value: stats.serviceDueStatus.dueSoon },
          {
            label: 'Service Due Overdue',
            value: stats.serviceDueStatus.overdue,
          },
        ],
      },
    ];
  }

  protected handleVehicleTableActionClick(
    event: ITableActionClickEvent<IVehicleGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showVehicleDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditVehicle(selectedFirstRow.id);
      return;
    }

    if (actionType === EButtonActionType.EVENT_HISTORY) {
      this.navigateToEventHistory(selectedFirstRow.id);
      return;
    }

    if (actionType === EButtonActionType.SERVICE_INFO) {
      this.navigateToServiceInfo(selectedFirstRow.id);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadVehicleList();
      },
    };

    if (
      actionType === EButtonActionType.HANDOVER_INITIATE ||
      actionType === EButtonActionType.HANDOVER_ACCEPTED ||
      actionType === EButtonActionType.HANDOVER_REJECTED ||
      actionType === EButtonActionType.HANDOVER_CANCELLED ||
      actionType === EButtonActionType.DEALLOCATE ||
      actionType === EButtonActionType.UNLINK ||
      actionType === EButtonActionType.LINK
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    if (
      actionType === EButtonActionType.LINK ||
      actionType === EButtonActionType.UNLINK
    ) {
      dynamicComponentInputs.sourceComponent = 'vehicle';
    }

    const recordDetail = this.prepareVehicleRecordDetail(
      selectedFirstRow,
      actionType
    );

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      VEHICLE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareVehicleRecordDetail(
    selectedRow: IVehicleGetBaseResponseDto,
    actionType: EButtonActionType
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Mileage',
        value: `${selectedRow.mileage} ${APP_CONFIG.VEHICLE_CONFIG.MILEAGE_UNIT}`,
      },
      {
        label: 'Fuel Type',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleFuelTypes(),
          selectedRow.fuelType
        ),
      },
      {
        label: 'Petro Card',
        value:
          selectedRow.associatedCard?.cardName &&
          selectedRow.associatedCard?.cardNumber
            ? `${selectedRow.associatedCard?.cardName} (${selectedRow.associatedCard?.cardNumber})`
            : 'N/A',
      },
    ];

    if (
      GetVehicleComponent.HANDOVER_DIALOG_ACTIONS.has(actionType) &&
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
        name: selectedRow.registrationNo,
        subtitle: `${selectedRow.brand} ${selectedRow.model}`,
      },
    };
  }

  private getLatestEventFileKeys(row: IVehicleGetBaseResponseDto): string[] {
    const files = row.latestEvent?.vehicleFiles;
    if (!files?.length) {
      return [];
    }
    return files
      .map(f => f.fileKey)
      .filter((k): k is string => typeof k === 'string' && k.length > 0);
  }

  protected getLatestEventFileKeysForRow(row: unknown): string[] {
    const r = row as IVehicle & {
      originalRawData?: IVehicleGetBaseResponseDto;
    };
    if (r?.originalRawData) {
      return this.getLatestEventFileKeys(r.originalRawData);
    }
    return this.getLatestEventFileKeys(row as IVehicleGetBaseResponseDto);
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

  private showVehicleDetailsDrawer(rowData: IVehicleGetBaseResponseDto): void {
    this.logger.logUserAction('Opening vehicle details drawer', rowData);

    this.drawerService.showDrawer(GetVehicleDetailComponent, {
      header: `Vehicle Details`,
      subtitle: `Detailed view of vehicle`,
      componentData: {
        vehicle: rowData,
      },
    });
  }

  private navigateToEditVehicle(vehicleId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE,
        ROUTES.VEHICLE.EDIT,
        vehicleId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing vehicle',
        error
      );
    }
  }

  private navigateToEventHistory(vehicleId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE,
        ROUTES.VEHICLE.EVENT_HISTORY,
      ];

      void this.routerNavigationService.navigateWithState(routeSegments, {
        vehicleId,
      });
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while viewing event history',
        error
      );
    }
  }

  private navigateToServiceInfo(vehicleId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_SERVICE,
        ROUTES.VEHICLE_SERVICE.LIST,
      ];

      void this.routerNavigationService.navigateWithState(routeSegments, {
        vehicleId,
      });
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while viewing service info',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addVehicle') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE,
        ROUTES.VEHICLE.ADD,
      ];
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
      title: 'Vehicle Management',
      subtitle: 'Manage vehicle records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Vehicle',
          actionName: 'addVehicle',
          permission: [APP_PERMISSION.VEHICLE.ADD],
        },
      ],
    };
  }
}
