import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ESeverity, EPrimeNGSeverity, ITagConfig } from '@shared/types';
import { StatusUtil } from '@shared/utility';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--status-tag-extended-text]': 'extendedPaletteTextCss',
  },
})
export class StatusTagComponent {
  value = input.required<string>();
  config = input<ITagConfig>();

  /** `SEVERITY_STYLES[severity].hex.dark` via `StatusUtil.getHexColors`. */
  get extendedPaletteTextCss(): string {
    if (this.config()?.severity) {
      return '';
    }
    const raw = this.value() ?? '';
    if (!StatusUtil.needsTailwindTagOverride(raw)) {
      return '';
    }
    return StatusUtil.getHexColors(raw).dark;
  }

  protected readonly tagStyleClass = computed(() => {
    if (this.config()?.severity) {
      return undefined;
    }
    const raw = this.value() ?? '';
    if (!StatusUtil.needsTailwindTagOverride(raw)) {
      return undefined;
    }
    const { bg } = StatusUtil.getColorClass(raw);
    // Label/icon color: `--status-tag-extended-text` (hex.dark). Root text-* fights PrimeNG.
    return `status-tag--extended-palette ${bg}`;
  });

  protected get severity(): EPrimeNGSeverity {
    return this.getSeverity(this.value());
  }

  private getSeverity(
    status: string | ESeverity | undefined
  ): EPrimeNGSeverity {
    if (this.config()?.severity) {
      return this.config()?.severity;
    }

    return StatusUtil.getSeverity(status ?? '') as EPrimeNGSeverity;
  }
}
