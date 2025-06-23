import { Component, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import { SharedTabsComponent } from '../../../../shared/components/shared-tabs/shared-tabs.component';
import { IMetricData, ITabItem } from '../../../../shared/models';
import { CardModule } from 'primeng/card';
import { ROUTE_BASE_PATHS } from '../../../../shared/constants';

@Component({
  selector: 'app-permission-list',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SharedTabsComponent,
    CardModule
  ],
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.scss'
})
export class PermissionListComponent {

  protected metricsCards = signal(this.getMetricCardsData());
  protected tabs = signal(this.getTabsData());

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Employee Access',
        subtitle: 'Active workforce permissions',
        iconClass: 'pi pi-users text-blue-500',
        iconBgClass: 'bg-blue-100',
        metrics: [
          { label: 'Field Workers', value: 42 },
          { label: 'Supervisors', value: 8 },
          { label: 'Managers', value: 5 },
        ],
      },
      {
        title: 'Department Roles',
        subtitle: 'Team-based access control',
        iconClass: 'pi pi-building text-green-500',
        iconBgClass: 'bg-green-100',
        metrics: [
          { label: 'Operations', value: 35 },
          { label: 'Finance', value: 6 },
          { label: 'Admin', value: 14 },
        ],
      },
    ];
  }

  onAddButtonClick() {
    console.log('Add button clicked');
  }

  private getTabsData(): ITabItem[] {
    return [
      {
        route: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
        label: 'Permissions',
        icon: 'pi pi-shield',
        tooltip: 'Manage system permissions',
      },
      {
        route: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        label: 'Roles',
        icon: 'pi pi-users',
        tooltip: 'Manage user roles'
      },
      {
        route: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
        label: 'Users',
        icon: 'pi pi-user',
        tooltip: 'Manage system users'
      },
    ];
  }
}
