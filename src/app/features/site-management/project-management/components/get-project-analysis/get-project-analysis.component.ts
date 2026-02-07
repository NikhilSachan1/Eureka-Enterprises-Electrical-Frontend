import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { ETabMode, ITabItem, ITabChange } from '@shared/types';
import { ICONS } from '@shared/constants';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { GetProjectProfitabilityComponent } from '../get-project-profitability/get-project-profitability.component';
import { GetProjectDocComponent } from '../project-doc/get-project-doc/get-project-doc.component';
import { GetDsrComponent } from '../project-dsr/get-dsr/get-dsr.component';
import { GetProjectTimelineComponent } from '../get-project-timeline/get-project-timeline.component';

@Component({
  selector: 'app-get-project-analysis',
  imports: [
    CardModule,
    NavTabsComponent,
    GetProjectProfitabilityComponent,
    GetProjectDocComponent,
    GetDsrComponent,
    GetProjectTimelineComponent,
  ],
  templateUrl: './get-project-analysis.component.html',
  styleUrl: './get-project-analysis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectAnalysisComponent {
  tabModeType = ETabMode.CONTENT;
  icons = ICONS;

  protected readonly activeTabIndex = signal(0);

  protected tabs = computed(() => this.getTabs());

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
}
