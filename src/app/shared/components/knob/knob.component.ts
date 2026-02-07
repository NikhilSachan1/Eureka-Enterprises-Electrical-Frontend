import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';
import { IKnobConfig } from '@shared/types';
import { DEFAULT_KNOB_CONFIG } from '@shared/config';

@Component({
  selector: 'app-knob',
  imports: [KnobModule, FormsModule],
  templateUrl: './knob.component.html',
  styleUrl: './knob.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnobComponent {
  config = input.required<Partial<IKnobConfig>>();

  protected knobConfig = computed(() => this.buildKnobConfig());

  private buildKnobConfig(): IKnobConfig {
    const finalConfig: IKnobConfig = {
      ...DEFAULT_KNOB_CONFIG,
      ...this.config(),
    } as IKnobConfig;

    return finalConfig;
  }
}
