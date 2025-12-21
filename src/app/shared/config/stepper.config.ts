import { IStepperConfig } from '@shared/types/stepper/stepper.interface';
import { EStepperOrientation } from '@shared/types/stepper/stepper.types';
import { EButtonActionType, EButtonIconPosition } from '@shared/types';
import { ICONS } from '@shared/constants';

export const DEFAULT_STEPPER_NEXT_BUTTON_CONFIG = {
  id: EButtonActionType.SUBMIT,
  label: 'Next',
  icon: ICONS.COMMON.ARROW_RIGHT,
  iconPosition: EButtonIconPosition.RIGHT,
};

export const DEFAULT_STEPPER_BACK_BUTTON_CONFIG = {
  id: EButtonActionType.RESET,
  label: 'Back',
  icon: ICONS.COMMON.ARROW_LEFT,
  iconPosition: EButtonIconPosition.LEFT,
};

export const DEFAULT_STEPPER_CONFIG: Partial<IStepperConfig> = {
  activeStep: 1,
  orientation: EStepperOrientation.HORIZONTAL,
  showNextAndBackButtons: true,
  linear: true,
};
