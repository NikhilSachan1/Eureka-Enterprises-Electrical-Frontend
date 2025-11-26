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
  visible?: boolean;
  tooltip?: string;
}
