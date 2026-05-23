import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { AppPermissionService } from '@core/services';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ICONS, ROUTES } from '@shared/constants';
import {
  ETabMode,
  IPageHeaderConfig,
  ITabItem,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG } from '../../config/form/search-filter-project-workspace.config';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';

@Component({
  selector: 'app-get-project-workspace',
  imports: [
    NavTabsComponent,
    GetProjectTimelineComponent,
    PageHeaderComponent,
    SearchFilterComponent,
  ],
  templateUrl: './get-project-workspace.component.html',
  styleUrl: './get-project-workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectWorkspaceComponent {
  private readonly router = inject(Router);
  private readonly appPermissionService = inject(AppPermissionService);

  protected readonly selectedProjectId = signal<string | undefined>(undefined);

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

  protected readonly visibleWorkspaceTabs = computed((): ITabItem[] =>
    this.buildWorkspaceTabs()
  );

  protected readonly pageHeaderConfig = computed(() =>
    this.buildPageHeaderConfig()
  );

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
