import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICONS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';

@Component({
  selector: 'app-main-dashboard',
  imports: [PageHeaderComponent, EmptyMessagesComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDashboardComponent {
  protected readonly ICONS = ICONS;

  protected readonly dashboardPageHeader: Partial<IPageHeaderConfig> = {
    title: 'Dashboard',
    subtitle: 'Coming soon — overview and insights will be available here.',
    showGoBackButton: false,
    showHeaderButton: false,
  };
}
