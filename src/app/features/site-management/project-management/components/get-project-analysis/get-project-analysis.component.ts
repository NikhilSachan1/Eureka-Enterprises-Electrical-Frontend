import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import {
  ETabMode,
  ITabItem,
  ITabChange,
  IPageHeaderConfig,
} from '@shared/types';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { GetDsrComponent } from '../../../dsr-management/components/get-dsr/get-dsr.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { LoggerService, AppPermissionService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { GetDocComponent } from '../../../doc-management/components/get-doc/get-doc.component';
import { GetProfitabilityComponent } from '@features/site-management/project-profitability/components/get-profitability/get-profitability.component';
import { GetProjectTimelineComponent } from '@features/site-management/project-timeline/components/get-project-timeline/get-project-timeline.component';
import { GetGstComponent } from '@features/site-management/gst-compliance/components/get-gst/get-gst.component';
import { IProjectGetBaseResponseDto } from '../../types/project.dto';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { DatePipe } from '@angular/common';

type ProjectAnalysisTabRoute =
  | 'profitability'
  | 'sales-documents'
  | 'purchase-documents'
  | 'gst-compliance'
  | 'daily-progress';

@Component({
  selector: 'app-get-project-analysis',
  imports: [
    CardModule,
    NavTabsComponent,
    GetDsrComponent,
    GetProjectTimelineComponent,
    PageHeaderComponent,
    GetDocComponent,
    GetProfitabilityComponent,
    GetGstComponent,
    DatePipe,
  ],
  templateUrl: './get-project-analysis.component.html',
  styleUrl: './get-project-analysis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectAnalysisComponent implements OnInit {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly logger = inject(LoggerService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly appPermissionService = inject(AppPermissionService);

  private readonly uiProjectAnalysis = APP_PERMISSION.UI.PROJECT_ANALYSIS;

  tabModeType = ETabMode.CONTENT;
  icons = ICONS;
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;

  protected readonly activeAnalysisRoute =
    signal<ProjectAnalysisTabRoute | null>(null);
  protected readonly projectData = signal<IProjectGetBaseResponseDto | null>(
    null
  );

  protected readonly showTimeline = computed(() => this.getShowTimeline());

  protected readonly visibleAnalysisTabs = computed(() => this.getTabs());

  protected readonly activeTabIndexForNav = computed(() => {
    const tabs = this.visibleAnalysisTabs();
    const route = this.activeAnalysisRoute();
    const i = tabs.findIndex(t => t.route === route);
    return i >= 0 ? i : 0;
  });

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  protected projectLocation = computed(() => {
    const data = this.projectData();
    if (!data) {
      return '';
    }
    const city = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.cities(),
      data.city
    );
    const state = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.states(),
      data.state
    );
    return `${city}, ${state}`;
  });

  protected projectStatus = computed(() => {
    const data = this.projectData();
    if (!data) {
      return '';
    }
    return String(
      getMappedValueFromArrayOfObjects(
        this.appConfigurationService.projectStatus(),
        data.status
      )
    );
  });

  protected contractors = computed(() => {
    const data = this.projectData();
    return (
      data?.siteContractors
        ?.map(sc => sc.contractor?.name)
        .filter((name): name is string => !!name) ?? []
    );
  });

  constructor() {
    effect(() => {
      const tabs = this.visibleAnalysisTabs();
      const route = this.activeAnalysisRoute();
      if (tabs.length === 0) {
        if (route !== null) {
          this.activeAnalysisRoute.set(null);
        }
        return;
      }
      if (route === null || !tabs.some(t => t.route === route)) {
        this.activeAnalysisRoute.set(tabs[0].route as ProjectAnalysisTabRoute);
      }
    });
  }

  ngOnInit(): void {
    this.loadProjectDataFromState();
  }

  private readonly PROJECT_STORAGE_KEY = 'project_analysis_data';

  private getShowTimeline(): boolean {
    return this.appPermissionService.hasPermission(
      this.uiProjectAnalysis.TIMELINE
    );
  }

  private loadProjectDataFromState(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;

    let projectData =
      this.routerNavigationService.getRouterStateData<IProjectGetBaseResponseDto>(
        'projectData'
      );

    if (!projectData) {
      const historyState = window.history.state as Record<string, unknown>;
      if (historyState && 'projectData' in historyState) {
        projectData = historyState['projectData'] as IProjectGetBaseResponseDto;
      }
    }

    if (!projectData && projectId) {
      projectData = this.getProjectFromStorage(projectId);
    }

    if (projectData) {
      this.saveProjectToStorage(projectId, projectData);
      this.projectData.set(projectData);

      this.logger.logUserAction('Project data loaded from router state', {
        projectId: projectData.id,
        projectName: projectData.name,
      });
    } else {
      this.logger.logUserAction(
        'No project data found in router state, only projectId available'
      );
    }
  }

  private getTabs(): ITabItem[] {
    type TabDef = ITabItem & { permission?: string[] };
    const definitions: TabDef[] = [
      {
        route: 'profitability',
        label: 'Profitability',
        icon: this.icons.COMMON.CHART,
        permission: [this.uiProjectAnalysis.PROFITABILITY],
      },
      {
        route: 'sales-documents',
        label: 'Contractor (Sales)',
        icon: this.icons.COMMON.FILE,
        permission: [this.uiProjectAnalysis.DOC],
      },
      {
        route: 'purchase-documents',
        label: 'Vendor (Purchase)',
        icon: this.icons.COMMON.FILE,
        permission: [this.uiProjectAnalysis.DOC],
      },
      {
        route: 'gst-compliance',
        label: 'GST 1 & 3B',
        icon: this.icons.COMMON.CHART,
        permission: [this.uiProjectAnalysis.DOC],
      },
      {
        route: 'daily-progress',
        label: 'Daily Progress',
        icon: this.icons.COMMON.CALENDAR,
        permission: [this.uiProjectAnalysis.DSR],
      },
    ];
    return this.appPermissionService.filterByPermission(definitions);
  }

  protected onTabChanged(event: ITabChange): void {
    this.activeAnalysisRoute.set(event.tab.route as ProjectAnalysisTabRoute);
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
    } else if (actionName === 'addDocument') {
      navigationRoute = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.DOC,
        ROUTES.SITE.DOC.ADD,
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
      title: 'Project Analysis',
      subtitle: 'Manage project records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Daily Status',
          actionName: 'addDailyStatus',
          permission: [this.uiProjectAnalysis.DSR],
        },
      ],
    };
  }

  private saveProjectToStorage(
    projectId: string,
    data: IProjectGetBaseResponseDto
  ): void {
    try {
      const storageKey = `${this.PROJECT_STORAGE_KEY}_${projectId}`;
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      this.logger.logUserAction(
        'Failed to save project data to sessionStorage'
      );
    }
  }

  private getProjectFromStorage(
    projectId: string
  ): IProjectGetBaseResponseDto | null {
    try {
      const storageKey = `${this.PROJECT_STORAGE_KEY}_${projectId}`;
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as IProjectGetBaseResponseDto;
      }
    } catch {
      this.logger.logUserAction(
        'Failed to read project data from sessionStorage'
      );
    }
    return null;
  }
}
