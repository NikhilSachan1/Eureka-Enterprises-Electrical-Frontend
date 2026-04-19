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
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { VehicleReadingService } from '../../services/vehicle-reading.service';
import {
  EButtonActionType,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  SEARCH_FILTER_VEHICLE_READING_FORM_CONFIG,
  VEHICLE_READING_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IVehicleReadingGetBaseResponseDto,
  IvehicleReadingGetFormDto,
  IVehicleReadingGetResponseDto,
} from '../../types/vehicle-reading.dto';
import { IVehicleReading } from '../../types/vehicle-reading.interface';
import { GetVehicleReadingDetailComponent } from '../get-vehicle-reading-detail/get-vehicle-reading-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-get-vehicle-reading',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    DataTableComponent,
    DecimalPipe,
  ],
  templateUrl: './get-vehicle-reading.component.html',
  styleUrl: './get-vehicle-reading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleReadingComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vehicleReadingService = inject(VehicleReadingService);
  private readonly loadingService = inject(LoadingService);
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  private readonly hasAssignedVehicle = signal<boolean | null>(null);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly APP_CONFIG = APP_CONFIG;

  ngOnInit(): void {
    this.applyLinkedVehicleFromAppConfiguration();
    this.table = this.dataTableService.createTable(
      VEHICLE_READING_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_VEHICLE_READING_FORM_CONFIG;
  }

  private applyLinkedVehicleFromAppConfiguration(): void {
    const linked = this.appConfigurationService.linkedUserVehicleDetail();
    if (linked === null) {
      this.hasAssignedVehicle.set(false);
      return;
    }

    const hasLinkedVehicle =
      !!linked.vehicle && Object.keys(linked.vehicle).length > 0;

    this.hasAssignedVehicle.set(hasLinkedVehicle);
  }

  private loadVehicleReadingList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading vehicle readings',
      message: "We're loading vehicle readings. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.vehicleReadingService
      .getVehicleReadingList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleReadingGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Vehicle reading records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction(
            'Failed to load vehicle reading records',
            error
          );
        },
      });
  }

  private prepareParamData(): IvehicleReadingGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IvehicleReadingGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IVehicleReadingGetBaseResponseDto[]
  ): IVehicleReading[] {
    return response.map((record: IVehicleReadingGetBaseResponseDto) => {
      const city = record.site?.city
        ? getMappedValueFromArrayOfObjects(
            this.appConfigurationService.cities(),
            record.site.city
          )
        : '';
      const state = record.site?.state
        ? getMappedValueFromArrayOfObjects(
            this.appConfigurationService.states(),
            record.site.state
          )
        : '';
      return {
        id: record.id,
        readingDate: record.logDate,
        vehicle: {
          ...record.vehicle,
          brandModel: `${record.vehicle['brand']} ${record.vehicle['model']}`, // TODO: Add brand and model
        },
        driver: {
          ...record.driver,
          fullName: `${record.driver.firstName} ${record.driver.lastName}`,
        },
        site: {
          ...(record.site ?? { id: '', city: '', state: '', name: '' }),
          location: `${city}, ${state}`,
        },
        meterReading: [
          record.startOdometerReading ?? null,
          record.endOdometerReading ?? null,
        ],
        totalKmTraveled: record.totalKmTraveled,
        anomalyStatus: record.anomalyDetected ? 'Anomaly Detected' : 'Normal',
        anomalyReason: record.anomalyReason,
        driverRemarks: record.driverRemarks,
        documentKeys: record.documentKeys,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVehicleReadingList();
  }

  protected handleVehicleReadingTableActionClick(
    event: ITableActionClickEvent<IVehicleReadingGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showVehicleReadingDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditVehicleReading(selectedFirstRow.id);
      return;
    }
  }

  private showVehicleReadingDetailsDrawer(
    rowData: IVehicleReadingGetBaseResponseDto
  ): void {
    this.logger.logUserAction(
      'Opening vehicle reading details drawer',
      rowData
    );

    this.drawerService.showDrawer(GetVehicleReadingDetailComponent, {
      header: `Vehicle Reading Details`,
      subtitle: `Detailed view of vehicle reading`,
      componentData: {
        vehicleReading: rowData,
      },
    });
  }

  private navigateToEditVehicleReading(vehicleReadingId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_READING,
        ROUTES.VEHICLE_READING.EDIT,
        vehicleReadingId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing vehicle reading',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addVehicleReading') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_READING,
        ROUTES.VEHICLE_READING.ADD,
      ];
    }
    if (actionName === 'manualVehicleReading') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_READING,
        ROUTES.VEHICLE_READING.FORCE,
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
    const noAssignedVehicle = this.hasAssignedVehicle() === false;

    return {
      title: 'Vehicle Reading Management',
      subtitle: 'Manage vehicle reading records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Vehicle Reading',
          icon: ICONS.COMMON.PLUS,
          actionName: 'addVehicleReading',
          permission: [APP_PERMISSION.VEHICLE_READING.ADD],
          disabled: noAssignedVehicle,
          disabledTooltip: noAssignedVehicle
            ? 'You have no vehicle assigned. Vehicle readings can only be added when at least one vehicle is assigned to you.'
            : undefined,
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
          label: 'Force Vehicle Reading',
          icon: ICONS.COMMON.FORCE,
          actionName: 'manualVehicleReading',
          permission: [APP_PERMISSION.VEHICLE_READING.FORCE],
        },
      ],
    };
  }
}
