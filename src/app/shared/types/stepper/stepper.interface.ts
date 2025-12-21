import { IButtonConfig } from '../button/button.interface';
import { EStepperOrientation } from './stepper.types';

export interface IStepperStepConfig {
  value: number;
  icon?: string;
  label?: string;
  stepTemplateKey?: string;
  panelConfig: IStepperPanelConfig;
}

export interface IStepperPanelConfig {
  title?: string;
  templateKey: string;
  nextButtonConfig?: Partial<IButtonConfig>;
  backButtonConfig?: Partial<IButtonConfig>;
  resetButtonConfig?: Partial<IButtonConfig>;
}

export interface IStepperConfig {
  steps: IStepperStepConfig[];
  activeStep?: number;
  orientation?: EStepperOrientation;
  showNextAndBackButtons?: boolean;
  showResetButton?: boolean;
  linear?: boolean;
}
