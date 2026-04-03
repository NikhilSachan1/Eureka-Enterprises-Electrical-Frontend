import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
import { GetProjectProfitabilityComponent } from '../get-project-profitability/get-project-profitability.component';
import { GetProjectDocComponent } from '../project-doc/get-project-doc/get-project-doc.component';
import { GetDsrComponent } from '../../../dsr-management/components/get-dsr/get-dsr.component';
import { GetProjectTimelineComponent } from '../get-project-timeline/get-project-timeline.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { LoggerService } from '@core/services';
import { RouterNavigationService } from '@shared/services';

@Component({
  selector: 'app-get-project-analysis',
  imports: [
    CardModule,
    NavTabsComponent,
    GetProjectProfitabilityComponent,
    GetProjectDocComponent,
    GetDsrComponent,
    GetProjectTimelineComponent,
    PageHeaderComponent,
  ],
  templateUrl: './get-project-analysis.component.html',
  styleUrl: './get-project-analysis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectAnalysisComponent {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly logger = inject(LoggerService);
  private readonly activatedRoute = inject(ActivatedRoute);

  tabModeType = ETabMode.CONTENT;
  icons = ICONS;

  protected readonly activeTabIndex = signal(0);

  protected tabs = computed(() => this.getTabs());
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  // protected metricsCards = computed(() => this.getMetricCardsData());

  private getTabs(): ITabItem[] {
    return [
      {
        route: 'profitability',
        label: 'Profitability',
        icon: this.icons.COMMON.CHART,
      },
      {
        route: 'documents',
        label: 'Documents',
        icon: this.icons.COMMON.FILE,
      },
      {
        route: 'daily-progress',
        label: 'Daily Progress',
        icon: this.icons.COMMON.CALENDAR,
      },
    ];
  }

  protected onTabChanged(event: ITabChange): void {
    this.activeTabIndex.set(event.index);
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];

    if (actionName === 'addDailyStatus') {
      const projectId = this.activatedRoute.snapshot.params[
        'projectId'
      ] as string;
      if (!projectId) {
        return;
      }

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
      title: 'Project Analysis',
      subtitle: 'Manage project records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Daily Status',
          actionName: 'addDailyStatus',
        },
      ],
    };
  }
}
