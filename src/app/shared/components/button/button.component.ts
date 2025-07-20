import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IButtonConfig } from '@shared/models';
import { DEFAULT_BUTTON_CONFIG } from '@shared/config';
import { EButtonIconPosition, EButtonType } from '@shared/types';

@Component({
  selector: 'app-button',
  imports: [ButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  ALL_BUTTON_ICON_POSITIONS = EButtonIconPosition;
  ALL_BUTTON_TYPES = EButtonType;

  buttonConfig = input<Partial<IButtonConfig>>();
  showButtonLoader = input<boolean>(false);
  showDisabledButton = input<boolean>(false);

  onButtonClick = output<boolean>();

  finalButtonConfig = computed(() => {
    const config = this.buttonConfig();

    if (!config || Object.keys(config).length === 0) {
      return {};
    }

    return {
      ...DEFAULT_BUTTON_CONFIG,
      ...config,
    };
  });

  hasConfig = computed(() => {
    const config = this.finalButtonConfig();
    return config && Object.keys(config).length > 0;
  });

  onClick(): void {
    this.onButtonClick.emit(true);
  }
}
