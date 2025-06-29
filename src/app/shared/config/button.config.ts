import { IButtonConfig } from "../models";
import { EButtonIconPosition, EButtonSeverity, EButtonSize, EButtonVariant } from "../types";

export const DEFAULT_BUTTON_CONFIG: Partial<IButtonConfig> = {
    type: 'button',
    iconPosition: EButtonIconPosition.LEFT,
    severity: EButtonSeverity.PRIMARY,
    shadow: false,
    rounded: false,
    variant: undefined,
    size: EButtonSize.SMALL,
    link: false,
    fluid: false,
}