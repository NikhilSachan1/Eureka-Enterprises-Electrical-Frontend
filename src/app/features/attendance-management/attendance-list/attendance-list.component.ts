import { Component, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { LoggerService } from '../../../core/services/logger.service';
import { inject, ChangeDetectionStrategy } from '@angular/core';
import { IMetricData } from '../../../shared/models/metric-data.model';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceListComponent {
  private readonly logger = inject(LoggerService);

  protected metricsCards = signal(this.getMetricCardsData());

  private getMetricCardsData(): IMetricData[] {
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

  protected onAddButtonClick(): void {
    try {
      this.logger.logUserAction('Attendance Add Button Click');
      // TODO: Implement add attendance functionality
    } catch (error) {
      this.logger.error('Error handling add button click', error);
    }
  }
}
