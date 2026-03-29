import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  IButtonConfig,
  EButtonIconPosition,
  EButtonSeverity,
  EButtonType,
} from '@shared/types';
import { DEFAULT_BUTTON_CONFIG } from '@shared/config';
import { StatusUtil } from '@shared/utility';

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
  stopClickPropagation = input<boolean>(false);

  onButtonClick = output<string>();

  finalButtonConfig = computed((): Partial<IButtonConfig> => {
    const config = this.buttonConfig();

    if (!config || Object.keys(config).length === 0) {
      return {} as Partial<IButtonConfig>;
    }

    const actionId = config.id ?? '';
    let { severity } = config;
    if (!severity && actionId && StatusUtil.exists(actionId)) {
      severity = StatusUtil.getSeverity(actionId) as EButtonSeverity;
    }
    const icon =
      config.icon ??
      (StatusUtil.exists(actionId) ? StatusUtil.getIcon(actionId) : undefined);

    return {
      ...DEFAULT_BUTTON_CONFIG,
      ...config,
      ...(severity && { severity }),
      ...(icon && { icon }),
    };
  });

  hasConfig = computed(() => {
    const config = this.finalButtonConfig();
    return config && Object.keys(config).length > 0;
  });

  onClick(event: MouseEvent): void {
    if (this.stopClickPropagation()) {
      event.stopPropagation();
    }
    this.onButtonClick.emit(this.buttonConfig()?.actionName ?? '');
  }
}
