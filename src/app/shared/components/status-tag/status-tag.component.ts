import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ESeverity, EPrimeNGSeverity } from '../../types';

export interface IStatusTagConfig {
  rounded?: boolean;
  customSeverityMap?: Record<string, EPrimeNGSeverity>;
}

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTagComponent {
  // Input signals
  value = input.required<string>();
  config = input<IStatusTagConfig>();

  // Computed severity based on the value
  protected get severity(): EPrimeNGSeverity {
    return this.getSeverity(this.value());
  }

  private getSeverity(status: string | ESeverity | undefined): EPrimeNGSeverity {
    // Use custom severity map if provided, otherwise use default
    const customMap = this.config()?.customSeverityMap;
    if (customMap && status && customMap[status.toLowerCase()]) {
      return customMap[status.toLowerCase()];
    }

    // Default severity mapping
    const severityMap: Record<string, EPrimeNGSeverity> = {
      [ESeverity.SUCCESS]: 'success',
      [ESeverity.INFO]: 'info',
      [ESeverity.WARNING]: 'warn',
      [ESeverity.DANGER]: 'danger',
      [ESeverity.SECONDARY]: 'secondary',
      'active': 'success',
      'allocated': 'success',
      'on leave': 'warn',
      'available': 'warn',
      'inactive': 'danger',
      'pending': 'warn',
      'approved': 'success',
      'rejected': 'danger',
      'present': 'success',
      'absent': 'danger',
      'leave': 'warn',
      'holiday': 'contrast',
      'checked in': 'info',
      'checked out': 'info',
      'not checked in': 'info',
      'not checked out': 'info',
    };

    return severityMap[status?.toLowerCase() ?? ''] ?? 'secondary';
  }
} 