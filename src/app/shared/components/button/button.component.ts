import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  viewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
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
  imports: [ButtonModule, TooltipModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  ALL_BUTTON_ICON_POSITIONS = EButtonIconPosition;
  ALL_BUTTON_TYPES = EButtonType;

  buttonConfig = input<Partial<IButtonConfig>>();
  styleClass = input<string | undefined>(undefined);
  showButtonLoader = input<boolean>(false);
  showDisabledButton = input<boolean>(false);
  stopClickPropagation = input<boolean>(false);

  onButtonClick = output<string>();

  private readonly tooltip = viewChild(Tooltip);
  private tapTipTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.tapTipTimer));
  }

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

  protected isButtonDisabled = computed(() => {
    const cfg = this.finalButtonConfig();
    return this.showDisabledButton() || cfg.disabled === true;
  });

  /** Prefer disabled reason when disabled; otherwise normal tooltip. */
  protected resolvedTooltip = computed((): string | undefined => {
    const cfg = this.finalButtonConfig();
    const disabled = this.isButtonDisabled();
    const dt = cfg.disabledTooltip?.trim();
    if (disabled && dt) {
      return dt;
    }
    return cfg.tooltip?.trim() ?? undefined;
  });

  /**
   * A tap on a disabled button shows why it is disabled. Phones have no hover, so the reason in
   * the tooltip was never seen there; the tap opens it for a few seconds.
   */
  protected onWrapperClick(event: Event): void {
    if (!this.isButtonDisabled() || !this.resolvedTooltip()) {
      return;
    }
    // The tap is about the reason, not the row or card behind the button.
    event.stopPropagation();
    const tip = this.tooltip();
    if (!tip) {
      return;
    }
    tip.activate();
    clearTimeout(this.tapTipTimer);
    this.tapTipTimer = setTimeout(() => tip.deactivate(), 3000);
  }

  onClick(event: MouseEvent): void {
    if (this.isButtonDisabled()) {
      return;
    }
    if (this.stopClickPropagation()) {
      event.stopPropagation();
    }
    this.onButtonClick.emit(this.buttonConfig()?.actionName ?? '');
  }
}
