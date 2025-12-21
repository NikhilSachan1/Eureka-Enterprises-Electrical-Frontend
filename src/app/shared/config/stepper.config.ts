import { IStepperConfig } from '@shared/types/stepper/stepper.interface';
import { EStepperOrientation } from '@shared/types/stepper/stepper.types';
import {
  EButtonActionType,
  EButtonIconPosition,
  EButtonVariant,
} from '@shared/types';
import { ICONS } from '@shared/constants';

export const DEFAULT_STEPPER_NEXT_BUTTON_CONFIG = {
  id: EButtonActionType.SUBMIT,
  label: 'Next',
  icon: ICONS.COMMON.ARROW_RIGHT,
  iconPosition: EButtonIconPosition.RIGHT,
  variant: EButtonVariant.OUTLINED,
};

export const DEFAULT_STEPPER_BACK_BUTTON_CONFIG = {
  id: EButtonActionType.RESET,
  label: 'Back',
  icon: ICONS.COMMON.ARROW_LEFT,
  iconPosition: EButtonIconPosition.LEFT,
  variant: EButtonVariant.OUTLINED,
};

export const DEFAULT_STEPPER_RESET_BUTTON_CONFIG = {
  id: EButtonActionType.RESET,
  label: 'Reset',
  variant: EButtonVariant.OUTLINED,
};

export const DEFAULT_STEPPER_CONFIG: Partial<IStepperConfig> = {
  activeStep: 1,
  orientation: EStepperOrientation.HORIZONTAL,
  showNextAndBackButtons: true,
  showResetButton: true,
  linear: true,
};
