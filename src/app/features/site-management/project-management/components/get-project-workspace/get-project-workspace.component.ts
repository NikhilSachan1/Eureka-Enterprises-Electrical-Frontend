import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import {
  ETabMode,
  IPageHeaderConfig,
  ITabItem,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { ICONS, ROUTES } from '@shared/constants';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { AppPermissionService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { RouterNavigationService } from '@shared/services';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG } from '../../config/form/search-filter-project-workspace.config';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';
import { ProjectWorkspaceInfoCardComponent } from '../project-workspace-info-card/project-workspace-info-card.component';

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

  private readonly uiProjectWorkspace = APP_PERMISSION.UI.PROJECT_WORKSPACE;

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
        projectName: [projectIdFromState],
      });
    }
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
    this.projectWorkspaceContext.clear();
  }

  ngOnDestroy(): void {
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
