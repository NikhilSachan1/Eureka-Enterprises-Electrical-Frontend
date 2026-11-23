import { IStepperConfig } from '@shared/types/stepper/stepper.interface';
import { EStepperOrientation } from '@shared/types/stepper/stepper.types';
import {
  EButtonActionType,
  EButtonIconPosition,
  EButtonVariant,
  EButtonSeverity,
} from '@shared/types';
import { ICONS } from '@shared/constants';

export const DEFAULT_STEPPER_NEXT_BUTTON_CONFIG = {
  id: EButtonActionType.SUBMIT,
  label: 'Next',
  icon: ICONS.COMMON.ARROW_RIGHT,
  iconPosition: EButtonIconPosition.RIGHT,
  variant: EButtonVariant.OUTLINED,
  severity: EButtonSeverity.PRIMARY,
};

export const DEFAULT_STEPPER_BACK_BUTTON_CONFIG = {
  id: EButtonActionType.RESET,
  label: 'Back',
  icon: ICONS.COMMON.ARROW_LEFT,
  iconPosition: EButtonIconPosition.LEFT,
  variant: EButtonVariant.OUTLINED,
  severity: EButtonSeverity.SECONDARY,
};

/** Per-step reset: clears only the step on screen; disabled until something is typed there. */
export const DEFAULT_STEPPER_RESET_BUTTON_CONFIG = {
  id: EButtonActionType.RESET,
  label: 'Clear this step',
  icon: ICONS.COMMON.ERASER,
  variant: EButtonVariant.TEXT,
  severity: EButtonSeverity.SECONDARY,
  tooltip: 'Clear the fields on this step only',
  disabledTooltip: 'Nothing to clear on this step yet',
};

/** Per-step reset on edit forms: the step goes back to the saved details, not blank. */
export const STEPPER_UNDO_STEP_BUTTON_CONFIG = {
  ...DEFAULT_STEPPER_RESET_BUTTON_CONFIG,
  label: 'Undo this step',
  icon: ICONS.COMMON.UNDO,
  tooltip: 'Put this step back to the saved details',
  disabledTooltip: 'No changes on this step',
};

export const DEFAULT_STEPPER_CONFIG: Partial<IStepperConfig> = {
  activeStep: 1,
  orientation: EStepperOrientation.HORIZONTAL,
  showNextAndBackButtons: true,
  showResetButton: true,
  linear: true,
};
