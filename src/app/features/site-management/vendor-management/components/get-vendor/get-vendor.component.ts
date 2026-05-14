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
import { VendorService } from '../../services/vendor.service';
import {
  EButtonActionType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IVendorGetBaseResponseDto,
  IVendorGetFormDto,
  IVendorGetResponseDto,
  IVendorGetStatsResponseDto,
} from '../../types/vendor.dto';
import {
  VENDOR_ACTION_CONFIG_MAP,
  VENDOR_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_VENDOR_FORM_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IVendor } from '../../types/vendor.interface';
import { EVendorStatus } from '../../types/vendor.enum';
import { GetVendorDetailComponent } from '../get-vendor-detail/get-vendor-detail.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
// import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-vendor',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-vendor.component.html',
  styleUrl: './get-vendor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVendorComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vendorService = inject(VendorService);
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
  private readonly vendorStats = signal<IVendorGetStatsResponseDto | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      VENDOR_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_VENDOR_FORM_CONFIG;
  }

  private loadVendorList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Vendor',
      message: "We're loading the vendor. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.vendorService
      .getVendorList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVendorGetResponseDto) => {
          const { records, overallStats: stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.vendorStats.set(stats);
          this.logger.logUserAction('Vendor records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.vendorStats.set(null);
          this.logger.logUserAction('Failed to load vendor records', error);
        },
      });
  }

  private prepareParamData(): IVendorGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IVendorGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IVendorGetBaseResponseDto[]): IVendor[] {
    return response.map((record: IVendorGetBaseResponseDto) => {
      return {
        id: record.id,
        name: record.name,
        vendorType:
          record.vendorType !== null && record.vendorType !== ''
            ? getMappedValueFromArrayOfObjects(
                this.appConfigurationService.vendorTypes(),
                record.vendorType
              )
            : '—',
        gstNumber: record.gstNumber ?? '—',
        contactNumber: record.contactNumber,
        email: record.email,
        status: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.contractorStatus(),
          record.isActive ? EVendorStatus.ACTIVE : EVendorStatus.ARCHIVED
        ),
        stateCity: `${getMappedValueFromArrayOfObjects(this.appConfigurationService.states(), record.state)}, ${getMappedValueFromArrayOfObjects(this.appConfigurationService.cities(), record.city)}`,
        pincode: record.pincode,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVendorList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.vendorStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'overview',
        title: 'Overview',
        metrics: [{ label: 'Total', value: stats.totalVendors }],
      },
      {
        id: 'status',
        title: 'Status',
        metrics: [
          { label: 'Active', value: stats.activeVendors },
          { label: 'Inactive', value: stats.inactiveVendors },
        ],
      },
      {
        id: 'vendorTypes',
        title: 'Vendor types',
        metrics: [
          { label: 'Freelancers', value: stats.freelancerVendors ?? 0 },
          {
            label: 'GST registered',
            value: stats.gstRegisteredVendors ?? 0,
          },
        ],
      },
    ];
  }

  protected handleVendorTableActionClick(
    event: ITableActionClickEvent<IVendorGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showVendorDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditVendor(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadVendorList();
      },
    };

    const recordDetail = this.prepareVendorRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      VENDOR_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareVendorRecordDetail(
    selectedRow: IVendorGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Contact Number',
        value: selectedRow.contactNumber,
      },
      {
        label: 'GST Number',
        value: selectedRow.gstNumber,
      },
      {
        label: 'Full Address',
        value: selectedRow.fullAddress,
      },
    ];
    return {
      details: [
        {
          status: {
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.contractorStatus(),
              selectedRow.isActive
                ? EVendorStatus.ACTIVE
                : EVendorStatus.ARCHIVED
            ),
          },
          entryData,
        },
      ],
      entity: {
        name: selectedRow.name,
      },
    };
  }

  private showVendorDetailsDrawer(rowData: IVendorGetBaseResponseDto): void {
    this.logger.logUserAction('Opening vendor details drawer', rowData);

    this.drawerService.showDrawer(GetVendorDetailComponent, {
      header: `Vendor Details`,
      subtitle: `Detailed view of vendor`,
      componentData: {
        vendor: rowData,
      },
    });
  }

  private navigateToEditVendor(vendorId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.VENDOR,
        ROUTES.SITE.VENDOR.EDIT,
        vendorId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction('Navigation error while editing vendor', error);
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addVendor') {
      navigationRoute = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.VENDOR,
        ROUTES.SITE.VENDOR.ADD,
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
      title: 'Vendor Management',
      subtitle: 'Manage vendor records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Vendor',
          actionName: 'addVendor',
          // permission: [APP_PERMISSION.VENDOR.ADD],
        },
      ],
    };
  }
}
