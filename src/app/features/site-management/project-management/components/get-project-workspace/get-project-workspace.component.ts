import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { AppPermissionService, LoggerService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ICONS, ROUTES } from '@shared/constants';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { NotificationService, RouterNavigationService } from '@shared/services';
import {
  ETabMode,
  IEnhancedForm,
  IInputFieldsConfig,
  ITabItem,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG } from '../../config/form/search-filter-project-workspace.config';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';
import { IProjectOverviewGetResponseDto } from '../../types/project.dto';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';
import { ProjectWorkspaceInfoCardComponent } from '../project-workspace-info-card/project-workspace-info-card.component';

type ProjectStakeholderFilterField = Extract<
  keyof IProjectWorkspaceSearchFilterFormDto,
  'companyName' | 'contractorName' | 'vendorName'
>;

const STAKEHOLDER_FILTERS: {
  field: ProjectStakeholderFilterField;
  emptyMessage: string;
  getIds: (overview: IProjectOverviewGetResponseDto) => string[];
}[] = [
  {
    field: 'companyName',
    emptyMessage: 'No company found',
    getIds: overview =>
      overview.site?.company?.id ? [overview.site.company.id] : [],
  },
  {
    field: 'contractorName',
    emptyMessage: 'No contractor found',
    getIds: overview =>
      (overview.contractors ?? [])
        .map(contractor => contractor?.id)
        .filter((id): id is string => !!id),
  },
  {
    field: 'vendorName',
    emptyMessage: 'No vendor found',
    getIds: overview =>
      (overview.vendors ?? [])
        .map(vendor => vendor?.id)
        .filter((id): id is string => !!id),
  },
];

const WORKSPACE_UI = APP_PERMISSION.UI.PROJECT_WORKSPACE;

@Component({
  selector: 'app-get-project-workspace',
  imports: [
    NavTabsComponent,
    GetProjectTimelineComponent,
    PageHeaderComponent,
    SearchFilterComponent,
    ProjectWorkspaceInfoCardComponent,
  ],
  templateUrl: './get-project-workspace.component.html',
  styleUrl: './get-project-workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectWorkspaceComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private unsubscribeProjectFilter?: () => void;
  private searchFilterForm?: IEnhancedForm<Record<string, unknown>>;

  private readonly searchFilterRef = viewChild(SearchFilterComponent);

  readonly tabModeType = ETabMode.ROUTER_OUTLET;
  icons = ICONS;

  private readonly routerUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly activeFilterTab = computed(() =>
    this.resolveProjectWorkspaceFilterTab(this.routerUrl())
  );

  protected readonly searchFilterConfig = computed(() =>
    this.buildProjectWorkspaceSearchFilterConfig(this.activeFilterTab())
  );

  protected readonly searchFilterPrefill = computed(() => {
    const workspaceFilter =
      this.projectWorkspaceContext.appliedWorkspaceFilter();
    if (!workspaceFilter) {
      return undefined;
    }

    const visibleFilter = this.pickFilterForTab(
      this.activeFilterTab(),
      workspaceFilter
    );

    return Object.keys(visibleFilter).length ? visibleFilter : undefined;
  });

  protected readonly showOverviewPanel = computed(
    () => !!this.projectWorkspaceContext.displayedProjectOverview()
  );

  protected readonly showTimeline = computed(() =>
    this.appPermissionService.hasPermission(WORKSPACE_UI.TIMELINE)
  );

  protected readonly visibleWorkspaceTabs = computed((): ITabItem[] =>
    this.appPermissionService.filterByPermission([
      {
        route: 'profitability',
        label: 'Profitability',
        icon: this.icons.COMMON.CHART,
        permission: [WORKSPACE_UI.PROFITABILITY],
      },
      {
        route: 'contractor-doc',
        label: 'Contractor (Sales)',
        icon: this.icons.COMMON.FILE,
        permission: [WORKSPACE_UI.DOC],
      },
      {
        route: 'vendor-doc',
        label: 'Vendor (Purchase)',
        icon: this.icons.COMMON.FILE,
        permission: [WORKSPACE_UI.DOC],
      },
      {
        route: 'daily-progress',
        label: 'Daily Progress',
        icon: this.icons.COMMON.CALENDAR,
        permission: [WORKSPACE_UI.DSR],
      },
    ])
  );

  protected readonly pageHeaderConfig = computed(() => ({
    title: 'Project workspace',
    subtitle: 'Profitability, documents, and daily site progress',
    showHeaderButton: false,
  }));

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.unsubscribeProjectFilter?.();
      this.projectWorkspaceContext.clear();
    });
  }

  ngOnInit(): void {
    const projectIdFromState =
      this.routerNavigationService.getRouterStateData<string>('projectId');

    if (projectIdFromState) {
      this.projectWorkspaceContext.setSelectedProject(projectIdFromState);
    }
  }

  protected onSearchFilterReady(
    form: IEnhancedForm<Record<string, unknown>>
  ): void {
    this.unsubscribeProjectFilter?.();
    this.searchFilterForm = form;

    const projectControl = form.formGroup.get('projectName');
    if (!projectControl) {
      return;
    }

    const contextProjectId = this.projectWorkspaceContext.selectedProjectId();
    if (!projectControl.value && contextProjectId) {
      projectControl.setValue(contextProjectId, { emitEvent: false });
    }

    const sub = projectControl.valueChanges
      .pipe(startWith(projectControl.value), distinctUntilChanged())
      .subscribe(projectId => {
        const id =
          typeof projectId === 'string' && projectId ? projectId : undefined;
        const overviewId = this.projectWorkspaceContext.overviewProjectId();

        if (!id) {
          if (overviewId) {
            this.resetStakeholderFieldValues(form);
            this.projectWorkspaceContext.setSelectedProject(undefined);
            this.resetStakeholderFilters();
          }
          return;
        }

        const projectChanged = !!overviewId && overviewId !== id;
        this.projectWorkspaceContext.setSelectedProject(id);
        if (projectChanged) {
          this.resetStakeholderFieldValues(form);
        }

        const overview = this.projectWorkspaceContext.projectOverview();
        if (!projectChanged && overview && overviewId === id) {
          this.applyStakeholderFilters(false, overview);
          this.syncDateRangeFilter();
          return;
        }

        this.applyStakeholderFilters(true);
        this.projectWorkspaceContext
          .loadOverview(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: response => {
              this.applyStakeholderFilters(false, response);
              this.syncDateRangeFilter();
            },
            error: error => {
              this.projectWorkspaceContext.resetOverview();
              this.applyStakeholderFilters(false);
              this.resetDateRangeFilter();
              this.logger.error('Failed to load project overview', error);
              this.notificationService.error(
                'Could not load project details. Please try again.'
              );
            },
          });
      });

    this.unsubscribeProjectFilter = (): void => sub.unsubscribe();
  }

  protected onWorkspaceFilterSubmit(filterData: Record<string, unknown>): void {
    this.projectWorkspaceContext.applyWorkspaceFilter(filterData);
  }

  protected onWorkspaceFilterReset(): void {
    this.resetStakeholderFilters();
    this.projectWorkspaceContext.clear();
  }

  private resetStakeholderFilters(): void {
    this.projectWorkspaceContext.resetOverview();
    this.applyStakeholderFilters(false);
    this.resetDateRangeFilter();
  }

  private applyStakeholderFilters(
    loading: boolean,
    overview?: IProjectOverviewGetResponseDto
  ): void {
    for (const { field, emptyMessage, getIds } of STAKEHOLDER_FILTERS) {
      this.updateMultiSelectFilter(
        field,
        overview ? getIds(overview) : [],
        loading,
        emptyMessage
      );
    }
  }

  private resetStakeholderFieldValues(
    form: IEnhancedForm<Record<string, unknown>>
  ): void {
    for (const { field } of STAKEHOLDER_FILTERS) {
      form.formGroup.get(field)?.reset(null, { emitEvent: false });
    }
  }

  private updateMultiSelectFilter(
    fieldName: ProjectStakeholderFilterField,
    availableIds: string[],
    loading: boolean,
    emptyMessage: string
  ): void {
    const baseConfig = this.searchFilterForm?.fieldConfigs[fieldName];
    const defaultMultiSelectConfig =
      this.searchFilterConfig().fields[fieldName]?.multiSelectConfig;

    if (!baseConfig || !defaultMultiSelectConfig) {
      return;
    }

    const updatedConfig = {
      ...baseConfig,
      multiSelectConfig: {
        ...defaultMultiSelectConfig,
        ...(availableIds.length
          ? { filterOptions: { include: availableIds } }
          : {
              optionsDropdown: [],
              dynamicDropdown: undefined,
              filterOptions: undefined,
              emptyMessage,
            }),
        loading,
      },
    } as IInputFieldsConfig;

    this.pushFilterFieldUpdate(fieldName, updatedConfig);
  }

  private syncDateRangeFilter(): void {
    if (!this.searchFilterForm) {
      return;
    }

    this.projectWorkspaceContext.patchDateField(
      this.searchFilterForm.fieldConfigs,
      'dateRange'
    );
    this.pushFilterFieldUpdate(
      'dateRange',
      this.searchFilterForm.fieldConfigs['dateRange']
    );
  }

  private resetDateRangeFilter(): void {
    const baseConfig = this.searchFilterForm?.fieldConfigs['dateRange'];
    if (!baseConfig) {
      return;
    }

    this.pushFilterFieldUpdate('dateRange', {
      ...baseConfig,
      dateConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange.dateConfig,
      },
    } as IInputFieldsConfig);
  }

  private pushFilterFieldUpdate(
    fieldName: string,
    config: IInputFieldsConfig
  ): void {
    if (this.searchFilterForm) {
      this.searchFilterForm.fieldConfigs[fieldName] = config;
    }
    this.searchFilterRef()?.updateFieldConfig(fieldName, config);
  }

  private resolveProjectWorkspaceFilterTab(url: string): string {
    const { PROFITABILITY, DAILY_PROGRESS, WORKSPACE_DOC } =
      ROUTES.SITE.PROJECT;
    const filterTabKeys = new Set<string>([
      PROFITABILITY,
      DAILY_PROGRESS,
      ...Object.values(WORKSPACE_DOC),
    ]);
    const segments = url.split('?')[0].split('/').filter(Boolean);

    for (let i = segments.length - 1; i >= 0; i--) {
      if (filterTabKeys.has(segments[i])) {
        return segments[i];
      }
    }

    return PROFITABILITY;
  }

  private buildProjectWorkspaceSearchFilterConfig(
    tab: string
  ): ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto> {
    const fields = Object.fromEntries(
      Object.entries(SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields)
        .filter(([, field]) =>
          this.isFieldVisibleForTab(field as { visibleOnTabs?: string[] }, tab)
        )
        .map(([key, field]) => {
          const rest = { ...(field as Record<string, unknown>) };
          delete rest['visibleOnTabs'];
          return [key, rest];
        })
    ) as ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto>['fields'];

    return { ...SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG, fields };
  }

  private pickFilterForTab(
    tab: string,
    workspaceFilter: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(workspaceFilter).filter(([key]) => {
        const field =
          SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields[
            key as keyof IProjectWorkspaceSearchFilterFormDto
          ];
        return (
          !!field &&
          this.isFieldVisibleForTab(field as { visibleOnTabs?: string[] }, tab)
        );
      })
    );
  }

  private isFieldVisibleForTab(
    field: { visibleOnTabs?: string[] },
    tab: string
  ): boolean {
    return !field.visibleOnTabs?.length || field.visibleOnTabs.includes(tab);
  }
}
