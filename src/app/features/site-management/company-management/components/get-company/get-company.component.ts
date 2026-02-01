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
import { CompanyService } from '../../services/company.service';
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
  ICompanyGetBaseResponseDto,
  ICompanyGetFormDto,
  ICompanyGetResponseDto,
  ICompanyGetStatsResponseDto,
} from '../../types/company.dto';
import {
  COMPANY_ACTION_CONFIG_MAP,
  COMPANY_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_COMPANY_FORM_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICompany } from '../../types/company.interface';
import { GetCompanyDetailComponent } from '../get-company-detail/get-company-detail.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ECompanyStatus } from '../../types/company.enum';

@Component({
  selector: 'app-get-company',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-company.component.html',
  styleUrl: './get-company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetCompanyComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly companyService = inject(CompanyService);
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
  private readonly companyStats = signal<ICompanyGetStatsResponseDto | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      COMPANY_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_COMPANY_FORM_CONFIG;
  }

  private loadCompanyList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Company',
      message: 'Please wait while we load the company...',
    });

    const paramData = this.prepareParamData();

    this.companyService
      .getCompanyList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ICompanyGetResponseDto) => {
          const { records, overallStats: stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.companyStats.set(stats);
          this.logger.logUserAction('Company records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.companyStats.set(null);
          this.logger.logUserAction('Failed to load company records', error);
        },
      });
  }

  private prepareParamData(): ICompanyGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<ICompanyGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: ICompanyGetBaseResponseDto[]): ICompany[] {
    return response.map((record: ICompanyGetBaseResponseDto) => {
      return {
        id: record.id,
        companyName: record.name,
        contactNumber: record.contactNumber,
        emailAddress: record.email,
        status: record.isActive
          ? ECompanyStatus.ACTIVE
          : ECompanyStatus.ARCHIVED,
        stateCity: `${record.state}, ${record.city}`,
        pincode: record.pincode,
        parentCompanyName: record.parentCompany?.name ?? null,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadCompanyList();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.companyStats();
    if (!stats) {
      return [];
    }

    return [
      { label: 'Total', value: stats.totalCompanies },
      { label: 'Active', value: stats.activeCompanies },
      // { label: 'Archived', value: stats.archivedCompanies },
      { label: 'Inactive', value: stats.inactiveCompanies },
    ];
  }

  protected handleCompanyTableActionClick(
    event: ITableActionClickEvent<ICompanyGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showCompanyDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditCompany(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadCompanyList();
      },
    };

    const recordDetail = this.prepareCompanyRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      COMPANY_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareCompanyRecordDetail(
    selectedRow: ICompanyGetBaseResponseDto
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
            approvalStatus: selectedRow.isActive
              ? ECompanyStatus.ACTIVE
              : ECompanyStatus.ARCHIVED,
          },
          entryData,
        },
      ],
      entity: {
        name: selectedRow.name,
        subtitle: selectedRow.parentCompany?.name,
      },
    };
  }

  private showCompanyDetailsDrawer(rowData: ICompanyGetBaseResponseDto): void {
    this.logger.logUserAction('Opening company details drawer', rowData);

    this.drawerService.showDrawer(GetCompanyDetailComponent, {
      header: `Company Details`,
      subtitle: `Detailed view of company`,
      componentData: {
        company: rowData,
      },
    });
  }

  private navigateToEditCompany(companyId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.COMPANY,
        ROUTES.SITE.COMPANY.EDIT,
        companyId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing company',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addCompany') {
      navigationRoute = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.COMPANY,
        ROUTES.SITE.COMPANY.ADD,
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
      title: 'Company Management',
      subtitle: 'Manage company records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Company',
          actionName: 'addCompany',
        },
      ],
    };
  }
}
