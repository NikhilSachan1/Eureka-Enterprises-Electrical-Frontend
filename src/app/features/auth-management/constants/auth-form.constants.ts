import { EButtonSize, EButtonSeverity, IButtonConfig } from '@shared/types';

export const ROLE_SELECTION_BUTTON_CONFIG: Record<
  string,
  Partial<IButtonConfig>
> = {
  continue: {
    label: 'Continue',
    type: 'button' as const,
    size: EButtonSize.LARGE,
    severity: EButtonSeverity.PRIMARY,
    fluid: true,
  },
  backToLogin: {
    label: 'Back to Login',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  },
} as const;
