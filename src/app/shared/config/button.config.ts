import {
  IButtonConfig,
  EButtonIconPosition,
  EButtonSeverity,
  EButtonSize,
} from '@shared/types';

export const DEFAULT_BUTTON_CONFIG: Partial<IButtonConfig> = {
  type: 'button',
  iconPosition: EButtonIconPosition.LEFT,
  severity: EButtonSeverity.SECONDARY,
  shadow: false,
  rounded: false,
  variant: undefined,
  size: EButtonSize.SMALL,
  link: false,
  fluid: false,
};
