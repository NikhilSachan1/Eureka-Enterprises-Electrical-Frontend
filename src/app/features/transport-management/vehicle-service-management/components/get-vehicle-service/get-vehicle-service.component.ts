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
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IVehicleServiceGetBaseResponseDto,
  IVehicleServiceGetFormDto,
  IVehicleServiceGetResponseDto,
  IVehicleServiceGetStatsResponseDto,
} from '../../types/vehicle-service.dto';
import {
  SEARCH_FILTER_VEHICLE_SERVICE_FORM_CONFIG,
  VEHICLE_SERVICE_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { VehicleServiceService } from '../../services/vehicle-service.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { VEHICLE_SERVICE_ACTION_CONFIG_MAP } from '../../config/dialog/get-vehicle-service.config';
import { IVehicleService } from '../../types/vehicle-service.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { GetVehicleServiceDetailComponent } from '../get-vehicle-service-detail/get-vehicle-service-detail.component';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-vehicle-service',
  imports: [
    DataTableComponent,
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
  ],
  templateUrl: './get-vehicle-service.component.html',
  styleUrl: './get-vehicle-service.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleServiceComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vehicleServiceService = inject(VehicleServiceService);
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
  private readonly vehicleServiceStats =
    signal<IVehicleServiceGetStatsResponseDto | null>(null);
  private readonly vehicleId = signal<string>('');
  protected readonly hasVehicleSelected = computed(() => !!this.vehicleId());
  protected prefillValues = signal<Record<string, unknown> | undefined>(
    undefined
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    const vehicleIdFromState =
      this.routerNavigationService.getRouterStateData<string>('vehicleId');

    if (vehicleIdFromState) {
      this.vehicleId.set(vehicleIdFromState);
      this.prefillValues.set({ vehicleName: vehicleIdFromState });
    }

    this.table = this.dataTableService.createTable(
      VEHICLE_SERVICE_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_VEHICLE_SERVICE_FORM_CONFIG;
  }

  private loadVehicleServiceList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Vehicle Service',
      message: 'Please wait while we load the vehicle service...',
    });

    const paramData = this.prepareParamData();

    this.vehicleServiceService
      .getVehicleServiceList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleServiceGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.vehicleServiceStats.set(stats);
          this.logger.logUserAction(
            'Vehicle service records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.vehicleServiceStats.set(null);
          this.logger.logUserAction(
            'Failed to load vehicle service records',
            error
          );
        },
      });
  }

  private prepareParamData(): IVehicleServiceGetFormDto {
    const params =
      this.tableServerSideFilterAndSortService.buildQueryParams<IVehicleServiceGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    if (this.vehicleId() && !params.vehicleName) {
      params.vehicleName = this.vehicleId();
    }

    return params;
  }

  private mapTableData(
    response: IVehicleServiceGetBaseResponseDto[]
  ): IVehicleService[] {
    return response.map((record: IVehicleServiceGetBaseResponseDto) => {
      return {
        id: record.id,
        serviceDate: record.serviceDate,
        odometerReading: record.odometerReading,
        serviceType: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleServiceTypes(),
          record.serviceType
        ),
        serviceCost: record.serviceCost,
        remarks: record.remarks,
        serviceFiles: record.documentKeys,
        vehicleName: `${record.vehicle.brand} ${record.vehicle.model}`,
        vehicle: record.vehicle,
        originalRawData: record,
      } satisfies IVehicleService;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVehicleServiceList();
  }

  protected onFilterSubmit(filterData: Record<string, unknown>): void {
    const selectedVehicleId = filterData['vehicleName'] as string | undefined;
    this.vehicleId.set(selectedVehicleId ?? '');
  }

  protected onFilterReset(): void {
    this.vehicleId.set('');
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.vehicleServiceStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'overview',
        title: 'Overview',
        icon: ICONS.COMMON.CHART,
        metrics: [
          { label: 'Total Services', value: stats.totalServices },
          {
            label: 'Total Cost',
            value: stats.totalCost,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
        ],
      },
    ];
  }

  protected handleVehicleServiceTableActionClick(
    event: ITableActionClickEvent<IVehicleServiceGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showVehicleServiceDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditVehicleService(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadVehicleServiceList();
      },
    };

    if (
      actionType === EButtonActionType.APPROVE ||
      actionType === EButtonActionType.REJECT
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail =
      this.prepareVehicleServiceRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      VEHICLE_SERVICE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareVehicleServiceRecordDetail(
    selectedRow: IVehicleServiceGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Date',
        value: selectedRow.serviceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Service Type',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleServiceTypes(),
          selectedRow.serviceType
        ),
      },
      {
        label: 'Odometer Reading',
        value: selectedRow.odometerReading,
        type: EDataType.NUMBER,
        format: APP_CONFIG.NUMBER_FORMATS.FLEXIBLE_DECIMALS,
      },
      {
        label: 'Service Cost',
        value: selectedRow.serviceCost,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Attachment(s)',
        value: selectedRow.documentKeys,
        type: EDataType.ATTACHMENTS,
      },
    ];
    return {
      details: [
        {
          entryData,
        },
      ],
      entity: {
        name: selectedRow.vehicle.registrationNo,
        subtitle: `${selectedRow.vehicle.brand} ${selectedRow.vehicle.model}`,
      },
    };
  }

  private showVehicleServiceDetailsDrawer(
    rowData: IVehicleServiceGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Opening expense details drawer', rowData);

    this.drawerService.showDrawer(GetVehicleServiceDetailComponent, {
      header: `Vehicle Service Details`,
      subtitle: `Detailed view of vehicle service`,
      componentData: {
        vehicleService: rowData,
      },
    });
  }

  private navigateToEditVehicleService(vehicleServiceId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_SERVICE,
        ROUTES.VEHICLE_SERVICE.EDIT,
        vehicleServiceId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing expense',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addVehicleService') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_SERVICE,
        ROUTES.VEHICLE_SERVICE.ADD,
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
      title: 'Vehicle Service Management',
      subtitle: 'Manage vehicle service records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Vehicle Service',
          actionName: 'addVehicleService',
          permission: [APP_PERMISSION.VEHICLE_SERVICE.ADD],
        },
      ],
    };
  }
}
