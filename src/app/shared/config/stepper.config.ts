import { IStepperConfig } from '@shared/types/stepper/stepper.interface';
import { EStepperOrientation } from '@shared/types/stepper/stepper.types';

export const DEFAULT_STEPPER_CONFIG: Partial<IStepperConfig> = {
  activeStep: 1,
  orientation: EStepperOrientation.HORIZONTAL,
};
