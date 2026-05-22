import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import {
  filter,
  map,
  startWith,
  distinctUntilChanged,
  finalize,
} from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AppPermissionService, LoggerService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ICONS, ROUTES } from '@shared/constants';
import { NotificationService, RouterNavigationService } from '@shared/services';
import {
  ETabMode,
  IEnhancedForm,
  IInputFieldsConfig,
  IPageHeaderConfig,
  ITabItem,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG } from '../../config/form/search-filter-project-workspace.config';
import { ProjectService } from '../../services/project.service';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';
import { IProjectOverviewGetResponseDto } from '../../types/project.dto';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';
import { ProjectWorkspaceInfoCardComponent } from '../project-workspace-info-card/project-workspace-info-card.component';

type ProjectStakeholderFilterField = Extract<
  keyof IProjectWorkspaceSearchFilterFormDto,
  'companyName' | 'contractorName' | 'vendorName'
>;

const STAKEHOLDER_FILTER_FIELDS: ProjectStakeholderFilterField[] = [
  'companyName',
  'contractorName',
  'vendorName',
];

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
export class GetProjectWorkspaceComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly uiProjectWorkspace = APP_PERMISSION.UI.PROJECT_WORKSPACE;
  private projectNameFilterSub?: Subscription;
  private searchFilterForm?: IEnhancedForm<Record<string, unknown>>;
  private lastSyncedProjectId?: string;

  private readonly searchFilterRef = viewChild(SearchFilterComponent);

  readonly tabModeType = ETabMode.ROUTER_OUTLET;
  icons = ICONS;

  protected readonly showTimeline = computed(() => this.getShowTimeline());
  protected readonly visibleWorkspaceTabs = computed(() => this.getTabs());
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly selectedProjectId =
    this.projectWorkspaceContext.selectedProjectId;

  protected readonly searchFilterPrefill = computed(() => {
    const workspaceFilter = this.projectWorkspaceContext.docWorkspaceFilter();
    if (!workspaceFilter) {
      return undefined;
    }

    const visibleFilter = this.pickFilterForTab(
      this.activeFilterTab(),
      workspaceFilter
    );

    return Object.keys(visibleFilter).length ? visibleFilter : undefined;
  });

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

  ngOnInit(): void {
    const projectIdFromState =
      this.routerNavigationService.getRouterStateData<string>('projectId');

    if (projectIdFromState) {
      this.projectWorkspaceContext.setDocWorkspaceFilter({
        projectName: projectIdFromState,
      });
    }
  }

  protected onSearchFilterReady(
    form: IEnhancedForm<Record<string, unknown>>
  ): void {
    this.projectNameFilterSub?.unsubscribe();
    this.searchFilterForm = form;
    this.lastSyncedProjectId = undefined;

    const projectControl = form.formGroup.get('projectName');
    if (!projectControl) {
      return;
    }

    const contextProjectId = this.projectWorkspaceContext.selectedProjectId();
    if (!projectControl.value && contextProjectId) {
      projectControl.setValue(contextProjectId, { emitEvent: false });
    }

    this.projectNameFilterSub = projectControl.valueChanges
      .pipe(startWith(projectControl.value), distinctUntilChanged())
      .subscribe(projectId => {
        const resolvedProjectId =
          typeof projectId === 'string' && projectId ? projectId : undefined;

        if (resolvedProjectId) {
          this.syncWorkspaceProjectId(resolvedProjectId);

          if (
            this.lastSyncedProjectId !== undefined &&
            this.lastSyncedProjectId !== resolvedProjectId
          ) {
            this.resetStakeholderFieldValues(form);
          }

          this.loadProjectStakeholderFilters(resolvedProjectId);
        } else {
          if (this.lastSyncedProjectId) {
            this.resetStakeholderFieldValues(form);
            this.syncWorkspaceProjectId(undefined);
          }

          this.resetStakeholderFilters();
        }

        this.lastSyncedProjectId = resolvedProjectId;
      });
  }

  private syncWorkspaceProjectId(projectId: string | undefined): void {
    const current = this.projectWorkspaceContext.docWorkspaceFilter();

    if (projectId) {
      if (current?.['projectName'] === projectId) {
        return;
      }

      this.projectWorkspaceContext.setDocWorkspaceFilter({
        ...(current ?? {}),
        projectName: projectId,
      });
      return;
    }

    if (!current?.['projectName']) {
      return;
    }

    const rest = { ...current };
    delete rest['projectName'];
    this.projectWorkspaceContext.setDocWorkspaceFilter(
      Object.keys(rest).length ? rest : null
    );
  }

  private resetStakeholderFieldValues(
    form: IEnhancedForm<Record<string, unknown>>
  ): void {
    STAKEHOLDER_FILTER_FIELDS.forEach(fieldName => {
      form.formGroup.get(fieldName)?.reset(null, { emitEvent: false });
    });
  }

  private loadProjectStakeholderFilters(projectId: string): void {
    this.projectWorkspaceContext.setProjectOverviewLoading(true);
    this.projectWorkspaceContext.setProjectOverview(null);

    this.applyMultiSelectStakeholderFilter(
      'companyName',
      [],
      true,
      'No company found'
    );
    this.applyMultiSelectStakeholderFilter(
      'contractorName',
      [],
      true,
      'No contractor found'
    );
    this.applyMultiSelectStakeholderFilter(
      'vendorName',
      [],
      true,
      'No vendor found'
    );

    this.projectService
      .getProjectOverview(projectId)
      .pipe(
        finalize(() => {
          this.projectWorkspaceContext.setProjectOverviewLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          this.projectWorkspaceContext.setProjectOverview(response);

          const companyId = response.site?.company?.id;
          const companyIds = companyId ? [companyId] : [];
          const contractorIds = (response.contractors ?? [])
            .map(contractor => contractor?.id)
            .filter((id): id is string => !!id);
          const vendorIds = (response.vendors ?? [])
            .map(vendor => vendor?.id)
            .filter((id): id is string => !!id);

          this.applyMultiSelectStakeholderFilter(
            'companyName',
            companyIds,
            false,
            'No company found'
          );
          this.applyMultiSelectStakeholderFilter(
            'contractorName',
            contractorIds,
            false,
            'No contractor found'
          );
          this.applyMultiSelectStakeholderFilter(
            'vendorName',
            vendorIds,
            false,
            'No vendor found'
          );
        },
        error: error => {
          this.projectWorkspaceContext.setProjectOverview(null);
          this.logger.error('Failed to load project overview', error);
          this.notificationService.error(
            'Could not load project details. Please try again.'
          );
          this.applyMultiSelectStakeholderFilter(
            'companyName',
            [],
            false,
            'No company found'
          );
          this.applyMultiSelectStakeholderFilter(
            'contractorName',
            [],
            false,
            'No contractor found'
          );
          this.applyMultiSelectStakeholderFilter(
            'vendorName',
            [],
            false,
            'No vendor found'
          );
        },
      });
  }

  private resetStakeholderFilters(): void {
    this.projectWorkspaceContext.setProjectOverview(null);
    this.projectWorkspaceContext.setProjectOverviewLoading(false);

    STAKEHOLDER_FILTER_FIELDS.forEach(fieldName => {
      const baseConfig = this.searchFilterForm?.fieldConfigs[fieldName];
      const defaultMultiSelectConfig =
        this.searchFilterConfig().fields[fieldName]?.multiSelectConfig;
      if (!baseConfig || !defaultMultiSelectConfig) {
        return;
      }

      this.searchFilterRef()?.updateFieldConfig(fieldName, {
        ...baseConfig,
        multiSelectConfig: {
          ...defaultMultiSelectConfig,
          filterOptions: undefined,
          optionsDropdown: undefined,
          emptyMessage: undefined,
          loading: false,
        },
      } as IInputFieldsConfig);
    });
  }

  private applyMultiSelectStakeholderFilter(
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

    const hasOptions = availableIds.length > 0;

    this.searchFilterRef()?.updateFieldConfig(fieldName, {
      ...baseConfig,
      multiSelectConfig: {
        ...defaultMultiSelectConfig,
        ...(hasOptions
          ? {
              filterOptions: {
                include: availableIds,
              },
            }
          : {
              optionsDropdown: [],
              dynamicDropdown: undefined,
              filterOptions: undefined,
              emptyMessage,
            }),
        loading,
      },
    } as IInputFieldsConfig);
  }

  private getShowTimeline(): boolean {
    return this.appPermissionService.hasPermission(
      this.uiProjectWorkspace.TIMELINE
    );
  }

  private getTabs(): ITabItem[] {
    type TabDef = ITabItem & { permission?: string[] };
    const definitions: TabDef[] = [
      {
        route: 'profitability',
        label: 'Profitability',
        icon: this.icons.COMMON.CHART,
        permission: [this.uiProjectWorkspace.PROFITABILITY],
      },
      {
        route: 'contractor-doc',
        label: 'Contractor (Sales)',
        icon: this.icons.COMMON.FILE,
        permission: [this.uiProjectWorkspace.DOC],
      },
      {
        route: 'vendor-doc',
        label: 'Vendor (Purchase)',
        icon: this.icons.COMMON.FILE,
        permission: [this.uiProjectWorkspace.DOC],
      },
      {
        route: 'daily-progress',
        label: 'Daily Progress',
        icon: this.icons.COMMON.CALENDAR,
        permission: [this.uiProjectWorkspace.DSR],
      },
    ];
    return this.appPermissionService.filterByPermission(definitions);
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Project workspace',
      subtitle: 'Profitability, documents, and daily site progress',
      showHeaderButton: false,
    };
  }

  protected onWorkspaceFilterSubmit(filterData: Record<string, unknown>): void {
    this.projectWorkspaceContext.setDocWorkspaceFilter({
      ...(this.projectWorkspaceContext.docWorkspaceFilter() ?? {}),
      ...filterData,
    });
  }

  protected onWorkspaceFilterReset(): void {
    this.resetStakeholderFilters();
    this.projectWorkspaceContext.clear();
  }

  ngOnDestroy(): void {
    this.projectNameFilterSub?.unsubscribe();
    this.projectWorkspaceContext.clear();
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
    interface WorkspaceField {
      visibleOnTabs?: string[];
    }

    const fields = Object.fromEntries(
      Object.entries(SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields)
        .filter(([, field]) =>
          this.isFieldVisibleForTab(field as WorkspaceField, tab)
        )
        .map(([key, field]) => [
          key,
          Object.fromEntries(
            Object.entries(field as Record<string, unknown>).filter(
              ([propKey]) => propKey !== 'visibleOnTabs'
            )
          ),
        ])
    ) as ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto>['fields'];

    return {
      ...SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG,
      fields,
    };
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

        if (!field) {
          return false;
        }

        return this.isFieldVisibleForTab(
          field as { visibleOnTabs?: string[] },
          tab
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
