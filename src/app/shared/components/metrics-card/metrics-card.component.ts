import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMetricData } from '../../models';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-card.component.html',
  styleUrls: ['./metrics-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsCardComponent {
  
  metricCardConfig = input<IMetricData>();

  getMetricClasses(label: string): { background: string; textColor: string } {
    switch (label) {
      case 'Present':
      case 'Approved':
      case 'Active':
      case 'Total Credit':
        return { background: 'bg-green-50', textColor: 'text-green-600' };
      case 'Absent':
      case 'Rejected':
      case 'Terminated':
      case 'Total Debit':
      case 'Total Approved Debit':
        return { background: 'bg-red-50', textColor: 'text-red-600' };
      case 'Pending':
      case 'Closing Balance':
        return { background: 'bg-yellow-50', textColor: 'text-yellow-600' };
      case 'Leave':
      case 'On Leave':
      case 'Opening Balance':
        return { background: 'bg-blue-50', textColor: 'text-blue-600' };
      case 'Holiday':
        return { background: 'bg-purple-50', textColor: 'text-purple-600' };
      default:
        return { background: 'bg-gray-50', textColor: 'text-gray-600' };
    }
  }
} 