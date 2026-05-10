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
import { ProjectService } from '../../services/project.service';
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
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IProjectGetBaseResponseDto,
  IProjectGetFormDto,
  IProjectGetResponseDto,
  IProjectGetStatsResponseDto,
} from '../../types/project.dto';
import {
  PROJECT_ACTION_CONFIG_MAP,
  PROJECT_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetProjectDetailComponent } from '../get-project-detail/get-project-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { IProject } from '../../types/project.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PopoverModule } from 'primeng/popover';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { SEARCH_FILTER_PROJECT_FORM_CONFIG } from '../../config/form/search-filter-project.config';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-project',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    ChipComponent,
    DataTableComponent,
    PopoverModule,
  ],
  templateUrl: './get-project.component.html',
  styleUrl: './get-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly projectService = inject(ProjectService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly budgetTrendIconBase = `${ICONS.COMMON.CHART_LINE} project-budget-cell__trend`;

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly projectStats = signal<IProjectGetStatsResponseDto | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      PROJECT_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_PROJECT_FORM_CONFIG;
  }

  private loadProjectList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading projects',
      message: "We're loading projects. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.projectService
      .getProjectList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.projectStats.set(stats);
          this.logger.logUserAction('Project records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.projectStats.set(null);
          this.logger.logUserAction('Failed to load project records', error);
        },
      });
  }

  private prepareParamData(): IProjectGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IProjectGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IProjectGetBaseResponseDto[]): IProject[] {
    return response.map((record: IProjectGetBaseResponseDto) => {
      const city = getMappedValueFromArrayOfObjects(
        this.appConfigurationService.cities(),
        record.city
      );
      const state = getMappedValueFromArrayOfObjects(
        this.appConfigurationService.states(),
        record.state
      );
      return {
        id: record.id,
        projectName: record.name,
        projectLocation: `${city} - ${state}`,
        projectStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectStatus(),
          record.status
        ),
        timeLine: [new Date(record.startDate), new Date(record.endDate)],
        workTypes: record.workTypes.map(wt =>
          String(
            getMappedValueFromArrayOfObjects(
              this.appConfigurationService.projectWorkTypes(),
              wt
            )
          )
        ),
        // estimatedBudget: record.estimatedBudget,
        // profitPercentage: record.profitPercentage,
        // totalSpent: record.totalSpent,
        projectManager: record.managerName,
        projectManagerContact: record.managerContact,
        stakeholders: {
          company: record.company,
          siteContractors: record.siteContractors,
          allocatedEmployees: record.allocatedEmployees,
        },
        originalRawData: record,
      } satisfies IProject;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadProjectList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.projectStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'overview',
        title: 'Overview',
        metrics: [{ label: 'Total', value: stats.totalSites }],
      },
      {
        id: 'status',
        title: 'By Status',
        metrics: [
          { label: 'Upcoming', value: stats.upcomingSites },
          { label: 'Ongoing', value: stats.ongoingSites },
          { label: 'Hold', value: stats.holdSites },
          { label: 'Completed', value: stats.completedSites },
        ],
      },
    ];
  }

  protected handleProjectTableActionClick(
    event: ITableActionClickEvent<IProjectGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showProjectDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditProject(selectedFirstRow.id);
      return;
    }

    if (actionType === EButtonActionType.WORKSPACE) {
      this.navigateToProjectWorkspace(selectedFirstRow);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadProjectList();
      },
    };

    const recordDetail = this.prepareProjectRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PROJECT_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareProjectRecordDetail(
    selectedRow: IProjectGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const city = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.cities(),
      selectedRow.city
    );
    const state = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.states(),
      selectedRow.state
    );
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Time Line',
        value: [selectedRow.startDate, selectedRow.endDate],
        type: EDataType.RANGE,
        dataType: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Project Budget',
        value: selectedRow.estimatedBudget,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
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
        name: selectedRow.name,
        subtitle: `${city} - ${state}`,
      },
    };
  }

  private showProjectDetailsDrawer(rowData: IProjectGetBaseResponseDto): void {
    this.logger.logUserAction('Opening project details drawer', rowData);

    this.drawerService.showDrawer(GetProjectDetailComponent, {
      header: `Project Details`,
      subtitle: `Detailed view of project`,
      componentData: {
        project: rowData,
      },
    });
  }

  private navigateToEditProject(projectId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.EDIT,
        projectId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing project',
        error
      );
    }
  }

  private navigateToProjectWorkspace(
    selectedRow: IProjectGetBaseResponseDto
  ): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.WORKSPACE,
        selectedRow.id,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while opening project workspace',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addProject') {
      navigationRoute = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.ADD,
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
      title: 'Project Management',
      subtitle: 'Manage project records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Project',
          actionName: 'addProject',
          permission: [APP_PERMISSION.PROJECT.ADD],
        },
      ],
    };
  }
}
