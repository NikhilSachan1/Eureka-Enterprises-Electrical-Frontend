import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AppConfigurationService,
  AvatarService,
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
import { IProject } from '../../types/project.interface';
import {
  PROJECT_ACTION_CONFIG_MAP,
  PROJECT_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetProjectDetailComponent } from '../get-project-detail/get-project-detail.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { KnobComponent } from '@shared/components/knob/knob.component';
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
    DataTableComponent,
    TooltipModule,
    PopoverModule,
    KnobComponent,
  ],
  templateUrl: './get-project.component.html',
  styleUrl: './get-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectComponent implements OnInit {
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
  private readonly avatarService = inject(AvatarService);

  protected table!: IEnhancedTable;
  protected employeePopoverRow = signal<IProject | null>(null);
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
      title: 'Loading Project',
      message: 'Please wait while we load the project...',
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
        },
        error: () => {
          this.table.setData([]);
          this.projectStats.set(null);
        },
      });
  }

  private prepareParamData(): IProjectGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IProjectGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IProjectGetResponseDto['records']
  ): IProject[] {
    return response.map(record => {
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
        allocatedEmployees: record.allocatedEmployees,
        projectName: record.name,
        projectLocation: `${city} - ${state}`,
        projectStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectStatus(),
          record.status
        ),
        timeLine: [new Date(record.startDate), new Date(record.endDate)],
        estimatedBudget: record.estimatedBudget,
        allocatedEmployeeCount: record.allocatedEmployeeCount ?? 0,
        healthScore: record.healthScore ?? 0,
        healthGrade: record.healthGrade,
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

    if (actionType === EButtonActionType.ANALYZE) {
      this.navigateToProjectAnalysis(selectedFirstRow.id);
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
    } catch {
      // Navigation error - silently fail
    }
  }

  private navigateToProjectAnalysis(projectId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.ANALYSIS,
        projectId,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch {
      // Navigation error - silently fail
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
    void this.routerNavigationService.navigateToRoute(navigationRoute);
  }

  protected getEmployees(
    row: IProject | null
  ): NonNullable<IProject['allocatedEmployees']> {
    return row?.allocatedEmployees ?? [];
  }

  protected getEmployeeInitial(emp: {
    firstName: string;
    lastName: string;
  }): string {
    const first = emp.firstName?.charAt(0) ?? '';
    const last = emp.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || '?';
  }

  protected getAvatarColor(emp: {
    firstName: string;
    lastName: string;
  }): string {
    const name = `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim();
    const hex = this.avatarService.getConsistentColor(name);
    return `#${hex}`;
  }

  protected getEmployeeCount(row: IProject | null): number {
    if (!row) {
      return 0;
    }
    const raw = row.originalRawData;
    const employees = raw?.allocatedEmployees ?? [];
    return raw?.allocatedEmployeeCount ?? employees.length ?? 0;
  }

  protected getHealthScoreKnobConfig(row: IProject): {
    value: number;
    valueTemplate: string;
    size: number;
  } {
    const score = row.healthScore ?? 0;
    const grade = row.healthGrade ?? '';
    return {
      value: score,
      valueTemplate: grade || String(score),
      size: 48,
    };
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
