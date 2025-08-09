import {
  EButtonBadgeSeverity,
  EButtonIconPosition,
  EButtonSeverity,
  EButtonSize,
  EButtonVariant,
  ETableActionType,
} from '@shared/types';

export interface IButtonConfig {
  id: ETableActionType;
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
