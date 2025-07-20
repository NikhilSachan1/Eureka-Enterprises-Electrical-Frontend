import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ESeverity, EPrimeNGSeverity } from '@shared/types';
import { ITagConfig } from '@app/shared/models';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTagComponent {
  value = input.required<string>();
  config = input<ITagConfig>();

  protected get severity(): EPrimeNGSeverity {
    return this.getSeverity(this.value());
  }

  private getSeverity(
    status: string | ESeverity | undefined
  ): EPrimeNGSeverity {
    if (this.config()?.severity) {
      return this.config()?.severity;
    }

    const severityMap: Record<string, EPrimeNGSeverity> = {
      [ESeverity.SUCCESS]: 'success',
      [ESeverity.INFO]: 'info',
      [ESeverity.WARNING]: 'warn',
      [ESeverity.DANGER]: 'danger',
      [ESeverity.SECONDARY]: 'secondary',
      active: 'success',
      allocated: 'success',
      'on leave': 'warn',
      available: 'warn',
      inactive: 'danger',
      pending: 'warn',
      approved: 'success',
      rejected: 'danger',
      present: 'success',
      absent: 'danger',
      leave: 'warn',
      holiday: 'contrast',
      'checked in': 'info',
      'checked out': 'info',
      'not checked in': 'info',
      'not checked out': 'info',
    };

    return severityMap[status?.toLowerCase() ?? ''] ?? 'secondary';
  }
}
