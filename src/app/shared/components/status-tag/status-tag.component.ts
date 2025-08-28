import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ESeverity, EPrimeNGSeverity } from '@shared/types';
import { ITagConfig } from '@shared/models';
import { ColorUtil } from '@shared/utils/color.util';

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

    return ColorUtil.getSeverity(status ?? '') as EPrimeNGSeverity;
  }
}
