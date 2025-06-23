import { Component, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import { IMetricData } from '../../../../shared/models/metric-data.model';

@Component({
  selector: 'app-permission-list',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent
  ],
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.scss'
})
export class PermissionListComponent {

  protected metricsCards = signal(this.getMetricCardsData());

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Total Permissions',
        subtitle: 'System wide permissions',
        iconClass: 'pi pi-shield text-blue-500',
        iconBgClass: 'bg-blue-100',
        metrics: [
          { label: 'Total', value: 5 },
        ],
      },
      {
        title: 'Total Roles',
        subtitle: 'System wide roles',
        iconClass: 'pi pi-users text-green-500',
        iconBgClass: 'bg-green-100',
        metrics: [
          { label: 'Total', value: 5 },
        ],
      },
      {
        title: 'Total Users',
        subtitle: 'System wide users',
        iconClass: 'pi pi-user text-purple-500',
        iconBgClass: 'bg-purple-100',
        metrics: [
          { label: 'Total', value: 5 },
        ],
      },
      {
        title: 'Module Permissions',
        subtitle: 'System wide module permissions',
        iconClass: 'pi pi-cog text-orange-500',
        iconBgClass: 'bg-orange-100',
        metrics: [
          { label: 'Total', value: 5 },
        ],
      },
    ];
  }

  onAddButtonClick() {
    console.log('Add button clicked');
  }
}
