import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { ConfigurationService } from '../../services/configuration.service';
import {
  EButtonActionType,
  EDataType,
  EDrawerSize,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  CONFIGURATION_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_CONFIGURATION_FORM_CONFIG,
} from '../../configs';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IConfigurationGetBaseResponseDto,
  IConfigurationGetRequestDto,
  IConfigurationGetResponseDto,
} from '../../types/configuration.dto';
import { GetConfigurationDetailComponent } from '../get-configuration-detail/get-configuration-detail.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { toTitleCase } from '@shared/utility';
import { IConfiguration } from '../../types/configuration.interface';
import { CONFIGURATION_ACTION_CONFIG_MAP } from '../../configs/dialog/get-configuration.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { APP_PERMISSION } from '@core/constants';

@Component({
  selector: 'app-get-configuration',
  imports: [PageHeaderComponent, SearchFilterComponent, DataTableComponent],
  templateUrl: './get-configuration.component.html',
  styleUrl: './get-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetConfigurationComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly loadingService = inject(LoadingService);
  private readonly drawerService = inject(DrawerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideParamsBuilderService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      CONFIGURATION_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_CONFIGURATION_FORM_CONFIG;
  }

  private loadConfigurationList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Configuration List',
      message: 'Please wait while we load the configuration list...',
    });

    const paramData = this.prepareParamData();

    this.configurationService
      .getConfigurationList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IConfigurationGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Configuration records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.logger.error('Failed to load configuration list', error);
        },
      });
  }

  private prepareParamData(): IConfigurationGetRequestDto {
    return this.tableServerSideParamsBuilderService.buildQueryParams<IConfigurationGetRequestDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IConfigurationGetBaseResponseDto[]
  ): IConfiguration[] {
    return response.map((record: IConfigurationGetBaseResponseDto) => {
      return {
        id: record.id,
        module: toTitleCase(record.module),
        key: record.key,
        label: toTitleCase(record.label),
        valueType: record.valueType,
        description: record.description,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadConfigurationList();
  }

  protected handleConfigurationTableActionClick(
    event: ITableActionClickEvent<IConfigurationGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showConfigurationDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditConfiguration(selectedFirstRow);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadConfigurationList();
      },
    };

    const recordDetail =
      this.prepareConfigurationRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      CONFIGURATION_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareConfigurationRecordDetail(
    selectedRow: IConfigurationGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Module Name',
        value: toTitleCase(selectedRow.module),
        type: EDataType.TEXT,
      },
      {
        label: 'Configuration Label',
        value: toTitleCase(selectedRow.label),
        type: EDataType.TEXT,
      },
      {
        label: 'Description',
        value: selectedRow.description,
        type: EDataType.TEXT,
      },
    ];
    return {
      details: [
        {
          entryData,
        },
      ],
    };
  }

  private showConfigurationDetailsDrawer(
    rowData: IConfigurationGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Opening configuration details drawer', rowData);

    this.drawerService.showDrawer(GetConfigurationDetailComponent, {
      header: `Configuration Details`,
      subtitle: `Detailed view of configuration`,
      size: EDrawerSize.LARGE,
      componentData: {
        configuration: rowData,
      },
    });
  }

  private navigateToEditConfiguration(
    row: IConfigurationGetBaseResponseDto
  ): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
        ROUTES.SETTINGS.CONFIGURATION.EDIT,
        row.id,
      ];

      void this.routerNavigationService.navigateWithState(routeSegments, {
        configurationDetail: row,
      });
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing configuration',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addConfiguration') {
      navigationRoute = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
        ROUTES.SETTINGS.CONFIGURATION.ADD,
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
      title: 'Configuration Management',
      subtitle: 'Manage configuration records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Configuration',
          actionName: 'addConfiguration',
          permission: [APP_PERMISSION.CONFIGURATION.ADD],
        },
      ],
    };
  }
}
