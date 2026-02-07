import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { IProgressBarConfig, EProgressBarMode } from '@shared/types';
import { DEFAULT_PROGRESS_BAR_CONFIG } from '@shared/config';

@Component({
  selector: 'app-progress-bar',
  imports: [ProgressBarModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  config = input.required<Partial<IProgressBarConfig>>();

  protected mode = computed(
    () => this.config().mode ?? EProgressBarMode.DETERMINATE
  );
  protected progressBarConfig = computed(() => this.buildProgressBarConfig());

  private buildProgressBarConfig(): IProgressBarConfig {
    const finalConfig: Partial<IProgressBarConfig> = {
      ...DEFAULT_PROGRESS_BAR_CONFIG,
      ...this.config(),
    };

    return finalConfig as IProgressBarConfig;
  }

  protected get shouldShowValue(): boolean {
    const config = this.progressBarConfig();
    return (
      config.showValue === true && config.mode === EProgressBarMode.DETERMINATE
    );
  }

  protected get displayContent(): string {
    const config = this.progressBarConfig();

    if (!this.shouldShowValue) {
      return '';
    }

    return `${config.value}${config.unit ?? ''}`;
  }
}
