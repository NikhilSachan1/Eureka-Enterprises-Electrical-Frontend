import { EButtonBadgeSeverity, EButtonIconPosition, EButtonSeverity, EButtonSize, EButtonVariant } from "../types";

export interface IButtonConfig {
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
}