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
import { VehicleService } from '../../services/vehicle.service';
import {
  EButtonActionType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IVehicleGetBaseResponseDto,
  IVehicleGetRequestDto,
  IVehicleGetResponseDto,
  IVehicleGetStatsResponseDto,
} from '../../types/vehicle.dto';
import {
  SEARCH_FILTER_VEHICLE_FORM_CONFIG,
  VEHICLE_ACTION_CONFIG_MAP,
  VEHICLE_TABLE_ENHANCED_CONFIG,
} from '../../config';
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

@Component({
  selector: 'app-get-vehicle',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-vehicle.component.html',
  styleUrl: './get-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleComponent implements OnInit {
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

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly vehicleStats = signal<IVehicleGetStatsResponseDto | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      VEHICLE_TABLE_ENHANCED_CONFIG
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

  private prepareParamData(): IVehicleGetRequestDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IVehicleGetRequestDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IVehicleGetBaseResponseDto[]): IVehicle[] {
    return response.map((record: IVehicleGetBaseResponseDto) => {
      return {
        id: record.id,
        vehicleNumber: record.registrationNo,
        vehicleName: `${record.brand} ${record.model}`,
        fuelType: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleFuelTypes(),
          record.fuelType
        ),
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
        fitnessStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleDocumentStatuses(),
          record.fitnessStatus
        ),
        serviceStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleServiceStatuses(),
          record.serviceDueStatus
        ),
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVehicleList();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.vehicleStats();
    if (!stats) {
      return [];
    }

    return [
      { label: 'Total', value: stats.total },
      {
        label: 'Available',
        value: stats.byStatus.available,
      },
      {
        label: 'Assigned',
        value: stats.byStatus.assigned,
      },
      {
        label: 'Under Maintenance',
        value: stats.byStatus.underMaintenance,
      },
      {
        label: 'PUC Expiring Soon',
        value: stats.pucStatus.expiringSoon,
      },
      {
        label: 'PUC Expired',
        value: stats.pucStatus.expired,
      },
      {
        label: 'Fitness Expiring Soon',
        value: stats.fitnessStatus.expiringSoon,
      },
      {
        label: 'Fitness Expired',
        value: stats.fitnessStatus.expired,
      },
      {
        label: 'Insurance Expiring Soon',
        value: stats.insuranceStatus.expiringSoon,
      },
      {
        label: 'Insurance Expired',
        value: stats.insuranceStatus.expired,
      },
      {
        label: 'Service Due Soon',
        value: stats.serviceDueStatus.dueSoon,
      },
      {
        label: 'Service Due Overdue',
        value: stats.serviceDueStatus.overdue,
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
      actionType === EButtonActionType.DEALLOCATE
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareVehicleRecordDetail(selectedFirstRow);

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
    selectedRow: IVehicleGetBaseResponseDto
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
        name: selectedRow.registrationNo,
        subtitle: `${selectedRow.brand} ${selectedRow.model}`,
      },
    };
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
        vehicleId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while viewing event history',
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
        },
      ],
    };
  }
}
