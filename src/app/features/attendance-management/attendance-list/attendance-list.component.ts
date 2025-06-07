import { Component, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-attendance-list',
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.scss'
})
export class AttendanceListComponent {

  protected metricsCards = signal(this.getMetricCardsData());

  private getMetricCardsData(): any[] {
    return [
      {
        title: 'Approval Status',
        subtitle: 'Request approval overview',
        iconClass: 'pi pi-check-circle text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Approved', value: 5 },
          { label: 'Pending', value: 3 },
          { label: 'Rejected', value: 1 },
        ],
      },
      {
        title: 'Attendance Status',
        subtitle: 'Employee attendance overview',
        iconClass: 'pi pi-clock text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'Present', value: 15 },
          { label: 'Absent', value: 3 },
          { label: 'Leave', value: 2 },
          { label: 'Holiday', value: 1 },
        ],
      },
    ];
  }


  onClickAddButton() {
    console.log('Add button clicked');
  }
}
