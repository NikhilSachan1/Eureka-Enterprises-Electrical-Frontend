import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CardModule } from 'primeng/card';
import {
  ETabMode,
  IPageHeaderConfig,
  ITabItem,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { LoggerService, AppPermissionService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { RouterNavigationService } from '@shared/services';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG } from '../../config';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';

@Component({
  selector: 'app-get-project-workspace',
  imports: [
    CardModule,
    NavTabsComponent,
    GetProjectTimelineComponent,
    PageHeaderComponent,
    SearchFilterComponent,
  ],
  templateUrl: './get-project-workspace.component.html',
  styleUrl: './get-project-workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectWorkspaceComponent implements OnInit, OnDestroy {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly logger = inject(LoggerService);
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

  protected readonly searchFilterPrefill = signal<
    Record<string, unknown> | undefined
  >(undefined);

  protected readonly searchFilterConfig: ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto> =
    SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG;

  ngOnInit(): void {
    const projectIdFromState =
      this.routerNavigationService.getRouterStateData<string>('projectId');

    if (projectIdFromState) {
      const seed = { projectName: [projectIdFromState] };
      this.projectWorkspaceContext.setDocWorkspaceFilter(seed);
      this.searchFilterPrefill.set(seed);
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
    this.projectWorkspaceContext.setDocWorkspaceFilter(filterData);
  }

  protected onWorkspaceFilterReset(): void {
    this.projectWorkspaceContext.clear();
  }

  ngOnDestroy(): void {
    this.projectWorkspaceContext.clear();
  }
}
