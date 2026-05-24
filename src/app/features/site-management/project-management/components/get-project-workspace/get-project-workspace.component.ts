import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize, map, startWith } from 'rxjs/operators';
import { LoggerService } from '@core/services';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ICONS, ROUTES } from '@shared/constants';
import {
  FormService,
  InputFieldConfigService,
  RouterNavigationService,
} from '@shared/services';
import {
  EDataType,
  ETabMode,
  IEnhancedForm,
  IInputFieldsConfig,
  IPageHeaderConfig,
  ITabItem,
  ITableSearchFilterFormConfig,
  ITrackedFields,
} from '@shared/types';
import { SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG } from '../../config/form/search-filter-project-workspace.config';
import { ProjectService } from '../../services/project.service';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';
import { IProjectOverviewGetResponseDto } from '../../types/project.dto';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';
import { ProjectWorkspaceInfoCardComponent } from '../project-workspace-info-card/project-workspace-info-card.component';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '../../utility/project-overview-date.util';

@Component({
  selector: 'app-get-project-workspace',
  imports: [
    NavTabsComponent,
    GetProjectTimelineComponent,
    ProjectWorkspaceInfoCardComponent,
    PageHeaderComponent,
    SearchFilterComponent,
  ],
  providers: [ProjectWorkspaceContextService],
  templateUrl: './get-project-workspace.component.html',
  styleUrl: './get-project-workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectWorkspaceComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly projectService = inject(ProjectService);
  private readonly formService = inject(FormService);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  protected readonly workspaceContext = inject(ProjectWorkspaceContextService);

  private readonly searchFilterRef = viewChild<SearchFilterComponent>(
    SearchFilterComponent
  );
  private workspaceFilterForm?: IEnhancedForm<IProjectWorkspaceSearchFilterFormDto>;
  private pendingAutoSearchProjectId: string | undefined;
  private readonly trackedWorkspaceFields = signal<
    ITrackedFields<IProjectWorkspaceSearchFilterFormDto> | undefined
  >(undefined);

  protected readonly selectedProjectId =
    this.workspaceContext.selectedProjectId;
  protected readonly projectOverview = this.workspaceContext.projectOverview;
  protected readonly filterPrefillValues = signal<
    Partial<IProjectWorkspaceSearchFilterFormDto>
  >({});
  protected readonly showOverviewPanel = signal(false);
  protected readonly isProjectOverviewLoading = signal(false);

  private readonly overviewProjectId = signal<string | undefined>(undefined);

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
    this.buildProjectWorkspaceSearchFilterConfig()
  );

  protected readonly visibleFilterFieldNames = computed(() =>
    this.getVisibleFilterFieldNames(this.activeFilterTab())
  );

  protected readonly visibleWorkspaceTabs = computed((): ITabItem[] =>
    this.buildWorkspaceTabs()
  );

  protected readonly pageHeaderConfig = computed(() =>
    this.buildPageHeaderConfig()
  );

  constructor() {
    const projectId =
      this.routerNavigationService.getCurrentNavigationStateData<string>(
        'projectId'
      );
    if (projectId) {
      this.filterPrefillValues.set({ projectName: projectId });
      this.workspaceContext.setActiveProjectId(projectId);
      this.pendingAutoSearchProjectId = projectId;
    }

    effect(() => {
      const trackedProjectId = this.trackedWorkspaceFields()?.projectName?.();
      this.onProjectChange(
        typeof trackedProjectId === 'string' ? trackedProjectId : undefined
      );
    });

    effect(() => {
      const tab = this.activeFilterTab();
      this.syncAppliedFiltersToActiveTab(tab);
    });
  }

  protected onFilterFormReady(
    form: IEnhancedForm<Record<string, unknown>>
  ): void {
    this.workspaceFilterForm =
      form as IEnhancedForm<IProjectWorkspaceSearchFilterFormDto>;

    this.trackedWorkspaceFields.set(
      this.formService.trackMultipleFieldChanges<IProjectWorkspaceSearchFilterFormDto>(
        this.workspaceFilterForm.formGroup,
        ['projectName'],
        this.destroyRef
      )
    );

    const appliedFilters = this.workspaceContext.filters();
    if (Object.keys(appliedFilters).length > 0) {
      this.workspaceFilterForm.patch(
        appliedFilters as Partial<IProjectWorkspaceSearchFilterFormDto>
      );
      this.searchFilterRef()?.markFilterSubmitted();
      this.showOverviewPanel.set(!!appliedFilters.projectName);
    }

    const overview = this.workspaceContext.projectOverview();
    if (this.overviewProjectId() && overview) {
      this.bindOverviewDropdownOptions(overview);
      this.patchWorkspaceDateRangeField(overview);
    }

    if (this.pendingAutoSearchProjectId) {
      this.pendingAutoSearchProjectId = undefined;
      queueMicrotask(() => {
        const searchFilter = this.searchFilterRef();
        if (searchFilter) {
          searchFilter.submitFilter();
          return;
        }

        if (this.workspaceFilterForm) {
          this.onFilterSubmit(
            this.workspaceFilterForm.getData() as Record<string, unknown>
          );
        }
      });
    }
  }

  protected onFilterSubmit(data: Record<string, unknown>): void {
    const visibleFilters = this.pickVisibleFilterValues(
      data,
      this.visibleFilterFieldNames()
    );

    this.filterPrefillValues.set({
      ...(data as IProjectWorkspaceSearchFilterFormDto),
    });
    this.workspaceContext.applyFilters(visibleFilters);
    this.showOverviewPanel.set(!!visibleFilters.projectName);
  }

  protected onFilterReset(): void {
    this.filterPrefillValues.set({});
    this.showOverviewPanel.set(false);
    this.clearProjectOverviewState();
    this.workspaceContext.resetFilters();
  }

  private onProjectChange(projectId: string | undefined): void {
    this.workspaceContext.setActiveProjectId(projectId);

    if (!projectId) {
      this.showOverviewPanel.set(false);
      this.clearProjectOverviewState();
      return;
    }

    if (projectId !== this.workspaceContext.selectedProjectId()) {
      this.showOverviewPanel.set(false);
    }

    if (projectId === this.overviewProjectId()) {
      return;
    }

    this.loadProjectOverview(projectId);
  }

  private loadProjectOverview(projectId: string): void {
    this.isProjectOverviewLoading.set(true);
    this.patchAllOverviewDropdowns(fieldName =>
      this.buildOverviewDropdownConfig(fieldName, [], true)
    );
    this.setWorkspaceDateRangeLoading(true);

    this.projectService
      .getProjectOverview(projectId)
      .pipe(
        finalize(() => this.isProjectOverviewLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          this.overviewProjectId.set(projectId);
          this.workspaceContext.setProjectOverview(response);
          this.bindOverviewDropdownOptions(response);
          this.patchWorkspaceDateRangeField(response);
        },
        error: error => {
          this.clearProjectOverviewState();
          this.logger.error('Failed to load project overview', error);
        },
      });
  }

  private bindOverviewDropdownOptions(
    overview: IProjectOverviewGetResponseDto
  ): void {
    const dropdownIds = this.extractOverviewDropdownIds(overview);

    this.patchAllOverviewDropdowns(fieldName =>
      this.buildOverviewDropdownConfig(fieldName, dropdownIds[fieldName], false)
    );
  }

  private clearProjectOverviewState(): void {
    this.overviewProjectId.set(undefined);
    this.workspaceContext.setProjectOverview(null);
    this.resetOverviewDropdownFields();
    this.resetWorkspaceDateRangeField();
  }

  private resetOverviewDropdownFields(): void {
    this.patchAllOverviewDropdowns(fieldName =>
      this.getOverviewFieldBaseConfig(fieldName)
    );
  }

  private getOverviewFieldBaseConfig(
    fieldName: 'companyName' | 'contractorName' | 'vendorName'
  ): IInputFieldsConfig {
    const rawFieldConfig =
      SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields[fieldName];

    return {
      ...this.inputFieldConfigService.getInputFieldConfig(
        EDataType.MULTI_SELECT,
        rawFieldConfig
      ),
      haveFullWidth: true,
    };
  }

  private patchAllOverviewDropdowns(
    buildConfig: (
      fieldName: 'companyName' | 'contractorName' | 'vendorName'
    ) => IInputFieldsConfig
  ): void {
    const searchFilter = this.searchFilterRef();
    if (!searchFilter) {
      return;
    }

    (['companyName', 'contractorName', 'vendorName'] as const).forEach(
      fieldName => {
        searchFilter.updateFieldConfig(fieldName, buildConfig(fieldName));
      }
    );

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private buildOverviewDropdownConfig(
    fieldName: 'companyName' | 'contractorName' | 'vendorName',
    availableIds: string[],
    loading: boolean
  ): IInputFieldsConfig {
    const defaultFieldConfig = this.getOverviewFieldBaseConfig(fieldName);
    const defaultMultiSelectConfig = defaultFieldConfig.multiSelectConfig;
    if (!defaultMultiSelectConfig) {
      return defaultFieldConfig;
    }

    const base =
      this.workspaceFilterForm?.fieldConfigs[fieldName] ?? defaultFieldConfig;

    return {
      ...base,
      haveFullWidth: true,
      multiSelectConfig: {
        ...defaultMultiSelectConfig,
        ...(availableIds.length
          ? { filterOptions: { include: availableIds } }
          : {
              optionsDropdown: [],
              dynamicDropdown: undefined,
              filterOptions: undefined,
              emptyMessage: this.getOverviewDropdownEmptyMessage(fieldName),
            }),
        loading,
      },
    };
  }

  private extractOverviewDropdownIds(
    overview: IProjectOverviewGetResponseDto
  ): {
    companyName: string[];
    contractorName: string[];
    vendorName: string[];
  } {
    return {
      companyName: overview.site?.company?.id ? [overview.site.company.id] : [],
      contractorName: (overview.contractors ?? [])
        .map(contractor => contractor?.id)
        .filter((id): id is string => !!id),
      vendorName: (overview.vendors ?? [])
        .map(vendor => vendor?.id)
        .filter((id): id is string => !!id),
    };
  }

  private getOverviewDropdownEmptyMessage(
    fieldName: 'companyName' | 'contractorName' | 'vendorName'
  ): string {
    if (fieldName === 'companyName') {
      return 'No company found';
    }
    if (fieldName === 'contractorName') {
      return 'No contractor found';
    }
    return 'No vendor found';
  }

  private patchWorkspaceDateRangeField(
    overview: IProjectOverviewGetResponseDto
  ): void {
    if (!this.workspaceFilterForm) {
      return;
    }

    applyProjectDateRangeFromOverview(
      this.workspaceFilterForm as unknown as IEnhancedForm<
        Record<string, unknown>
      >,
      'dateRange',
      SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields.dateRange?.dateConfig,
      overview
    );

    this.syncWorkspaceDateRangeFieldConfig();
  }

  private setWorkspaceDateRangeLoading(loading: boolean): void {
    if (!this.workspaceFilterForm) {
      return;
    }

    setProjectDateFieldLoading(
      this.workspaceFilterForm as unknown as IEnhancedForm<
        Record<string, unknown>
      >,
      'dateRange',
      loading
    );

    this.syncWorkspaceDateRangeFieldConfig();
  }

  private syncWorkspaceDateRangeFieldConfig(): void {
    const searchFilter = this.searchFilterRef();
    const dateRangeConfig = this.workspaceFilterForm?.fieldConfigs.dateRange;
    if (searchFilter && dateRangeConfig) {
      searchFilter.updateFieldConfig('dateRange', dateRangeConfig);
    }

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private resetWorkspaceDateRangeField(): void {
    if (!this.workspaceFilterForm) {
      return;
    }

    resetProjectDateField(
      this.workspaceFilterForm as unknown as IEnhancedForm<
        Record<string, unknown>
      >,
      'dateRange',
      SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields.dateRange?.dateConfig
    );

    this.syncWorkspaceDateRangeFieldConfig();
  }

  private resolveProjectWorkspaceFilterTab(url: string): string {
    const { PROFITABILITY, DAILY_PROGRESS, GST_SUMMARY, WORKSPACE_DOC } =
      ROUTES.SITE.PROJECT;
    const filterTabKeys = new Set<string>([
      PROFITABILITY,
      DAILY_PROGRESS,
      GST_SUMMARY,
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

  private buildProjectWorkspaceSearchFilterConfig(): ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto> {
    const fields = Object.fromEntries(
      Object.entries(SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields).map(
        ([key, field]) => {
          const rest = { ...(field as Record<string, unknown>) };
          delete rest['visibleOnTabs'];
          return [key, rest];
        }
      )
    ) as ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto>['fields'];

    return { ...SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG, fields };
  }

  private getVisibleFilterFieldNames(tab: string): string[] {
    return Object.entries(SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG.fields)
      .filter(([, field]) =>
        this.isFieldVisibleForTab(field as { visibleOnTabs?: string[] }, tab)
      )
      .map(([fieldName]) => fieldName);
  }

  private pickVisibleFilterValues(
    data: Record<string, unknown>,
    visibleFieldNames: string[]
  ): IProjectWorkspaceSearchFilterFormDto {
    const filters: IProjectWorkspaceSearchFilterFormDto = {};

    visibleFieldNames.forEach(fieldName => {
      const value = data[fieldName];
      if (!this.hasFilterValue(value)) {
        return;
      }

      filters[fieldName as keyof IProjectWorkspaceSearchFilterFormDto] =
        value as never;
    });

    return filters;
  }

  private hasFilterValue(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  }

  private syncAppliedFiltersToActiveTab(tab: string): void {
    const appliedFilters = this.workspaceContext.filters();
    if (!Object.keys(appliedFilters).length) {
      return;
    }

    const visibleFilters = this.pickVisibleFilterValues(
      appliedFilters as Record<string, unknown>,
      this.getVisibleFilterFieldNames(tab)
    );

    if (this.areWorkspaceFiltersEqual(appliedFilters, visibleFilters)) {
      return;
    }

    this.workspaceContext.applyFilters(visibleFilters);
  }

  private areWorkspaceFiltersEqual(
    current: IProjectWorkspaceSearchFilterFormDto,
    next: IProjectWorkspaceSearchFilterFormDto
  ): boolean {
    const keys = new Set([
      ...Object.keys(current),
      ...Object.keys(next),
    ]) as Set<keyof IProjectWorkspaceSearchFilterFormDto>;

    for (const key of keys) {
      if (
        JSON.stringify(current[key] ?? null) !==
        JSON.stringify(next[key] ?? null)
      ) {
        return false;
      }
    }

    return true;
  }

  private isFieldVisibleForTab(
    field: { visibleOnTabs?: string[] },
    tab: string
  ): boolean {
    return !field.visibleOnTabs?.length || field.visibleOnTabs.includes(tab);
  }

  private buildWorkspaceTabs(): ITabItem[] {
    return [
      {
        route: 'profitability',
        label: 'Profitability',
        icon: this.icons.COMMON.CHART,
      },
      {
        route: 'contractor-doc',
        label: 'Contractor (Sales)',
        icon: this.icons.COMMON.FILE,
      },
      {
        route: 'vendor-doc',
        label: 'Vendor (Purchase)',
        icon: this.icons.COMMON.FILE,
      },
      {
        route: 'gst-summary',
        label: 'GST Summary',
        icon: this.icons.COMMON.TAG,
      },
      {
        route: 'daily-progress',
        label: 'Daily Progress',
        icon: this.icons.COMMON.CALENDAR,
      },
    ];
  }

  private buildPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Project workspace',
      subtitle: 'Profitability, documents, and daily site progress',
      showHeaderButton: false,
    };
  }
}
