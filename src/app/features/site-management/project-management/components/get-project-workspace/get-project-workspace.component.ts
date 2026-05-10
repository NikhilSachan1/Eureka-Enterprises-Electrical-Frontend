import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import {
  ETabMode,
  IPageHeaderConfig,
  ITabItem,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { LoggerService, AppPermissionService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { RouterNavigationService } from '@shared/services';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG } from '../../config';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';

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
export class GetProjectWorkspaceComponent {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly logger = inject(LoggerService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly appPermissionService = inject(AppPermissionService);

  private readonly uiProjectWorkspace = APP_PERMISSION.UI.PROJECT_WORKSPACE;

  readonly tabModeType = ETabMode.ROUTER_OUTLET;
  icons = ICONS;

  protected readonly showTimeline = computed(() => this.getShowTimeline());
  protected readonly visibleWorkspaceTabs = computed(() => this.getTabs());
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  protected readonly searchFilterConfig: ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto> =
    SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG;

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

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      return;
    }

    if (actionName === 'addDailyStatus') {
      navigationRoute = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.DSR,
        ROUTES.SITE.DSR.ADD,
        projectId,
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
      title: 'Project workspace',
      subtitle: 'Profitability, documents, and daily site progress',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Daily Status',
          actionName: 'addDailyStatus',
          permission: [this.uiProjectWorkspace.DSR],
        },
      ],
    };
  }
}
