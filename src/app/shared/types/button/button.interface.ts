import {
  EButtonBadgeSeverity,
  EButtonIconPosition,
  EButtonSeverity,
  EButtonSize,
  EButtonVariant,
  EButtonActionType,
} from '@shared/types';

export interface IButtonConfig {
  id: EButtonActionType;
  type: string;
  label: string;
  icon: string;
  iconPosition: EButtonIconPosition;
  severity: EButtonSeverity;
  shadow: boolean;
  rounded: boolean;
  variant: EButtonVariant | undefined;
  badge: string | undefined;
  badgeSeverity: EButtonBadgeSeverity | undefined;
  size: EButtonSize | undefined;
  link: boolean;
  fluid: boolean;
  /** Disables the button; use with `disabledTooltip` for the reason. */
  disabled?: boolean;
  visible?: boolean;
  tooltip?: string;
  /** Shown when the button is disabled (e.g. why the action is unavailable). */
  disabledTooltip?: string;
  actionName?: string;
  permission?: string[];
}
