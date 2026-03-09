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
import { ContractorService } from '../../services/contractor.service';
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
  IContractorGetBaseResponseDto,
  IContractorGetFormDto,
  IContractorGetResponseDto,
  IContractorGetStatsResponseDto,
} from '../../types/contractor.dto';
import {
  CONTRACTOR_ACTION_CONFIG_MAP,
  CONTRACTOR_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_CONTRACTOR_FORM_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IContractor } from '../../types/contractor.interface';
import { EContractorStatus } from '../../types/contractor.enum';
import { GetContractorDetailComponent } from '../get-contractor-detail/get-contractor-detail.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-contractor',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-contractor.component.html',
  styleUrl: './get-contractor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetContractorComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly contractorService = inject(ContractorService);
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
  private readonly contractorStats =
    signal<IContractorGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      CONTRACTOR_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_CONTRACTOR_FORM_CONFIG;
  }

  private loadContractorList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Contractor',
      message: 'Please wait while we load the contractor...',
    });

    const paramData = this.prepareParamData();

    this.contractorService
      .getContractorList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IContractorGetResponseDto) => {
          const { records, overallStats: stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.contractorStats.set(stats);
          this.logger.logUserAction('Contractor records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.contractorStats.set(null);
          this.logger.logUserAction('Failed to load contractor records', error);
        },
      });
  }

  private prepareParamData(): IContractorGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IContractorGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IContractorGetBaseResponseDto[]
  ): IContractor[] {
    return response.map((record: IContractorGetBaseResponseDto) => {
      return {
        id: record.id,
        contractorName: record.name,
        contactNumber: record.contactNumber,
        emailAddress: record.email,
        status: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.contractorStatus(),
          record.isActive
            ? EContractorStatus.ACTIVE
            : EContractorStatus.ARCHIVED
        ),
        stateCity: `${getMappedValueFromArrayOfObjects(this.appConfigurationService.states(), record.state)}, ${getMappedValueFromArrayOfObjects(this.appConfigurationService.cities(), record.city)}`,
        pincode: record.pincode,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadContractorList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.contractorStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'overview',
        title: 'Overview',
        metrics: [{ label: 'Total', value: stats.totalContractors }],
      },
      {
        id: 'status',
        title: 'Status',
        metrics: [
          { label: 'Active', value: stats.activeContractors },
          { label: 'Inactive', value: stats.inactiveContractors },
        ],
      },
    ];
  }

  protected handleContractorTableActionClick(
    event: ITableActionClickEvent<IContractorGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showContractorDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditContractor(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadContractorList();
      },
    };

    const recordDetail = this.prepareContractorRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      CONTRACTOR_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareContractorRecordDetail(
    selectedRow: IContractorGetBaseResponseDto
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
                ? EContractorStatus.ACTIVE
                : EContractorStatus.ARCHIVED
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

  private showContractorDetailsDrawer(
    rowData: IContractorGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Opening contractor details drawer', rowData);

    this.drawerService.showDrawer(GetContractorDetailComponent, {
      header: `Contractor Details`,
      subtitle: `Detailed view of contractor`,
      componentData: {
        contractor: rowData,
      },
    });
  }

  private navigateToEditContractor(contractorId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.CONTRACTOR,
        ROUTES.SITE.CONTRACTOR.EDIT,
        contractorId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing contractor',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addContractor') {
      navigationRoute = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.CONTRACTOR,
        ROUTES.SITE.CONTRACTOR.ADD,
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
      title: 'Contractor Management',
      subtitle: 'Manage contractor records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Contractor',
          actionName: 'addContractor',
          permission: [APP_PERMISSION.CONTRACTOR.ADD],
        },
      ],
    };
  }
}
