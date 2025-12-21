import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  TemplateRef,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import {
  IStepperConfig,
  IStepperPanelConfig,
} from '@shared/types/stepper/stepper.interface';
import {
  DEFAULT_STEPPER_CONFIG,
  DEFAULT_STEPPER_NEXT_BUTTON_CONFIG,
  DEFAULT_STEPPER_BACK_BUTTON_CONFIG,
} from '@shared/config';
import { ButtonComponent } from '../button/button.component';
import { EStepperOrientation } from '@shared/types';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, StepperModule, ButtonComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent implements OnInit {
  stepperConfig = input<Partial<IStepperConfig>>();
  panelTemplates = input.required<Record<string, TemplateRef<unknown>>>();

  protected readonly activeStep = signal<number>(1);

  protected readonly ALL_STEPPER_ORIENTATIONS = EStepperOrientation;

  protected readonly finalStepperConfig = computed(() => {
    const config = this.stepperConfig();

    if (!config || Object.keys(config).length === 0) {
      return DEFAULT_STEPPER_CONFIG as IStepperConfig;
    }

    const mergedConfig = {
      ...DEFAULT_STEPPER_CONFIG,
      ...config,
    } as IStepperConfig;

    // Merge default button configs with panel configs
    if (mergedConfig.steps) {
      mergedConfig.steps = mergedConfig.steps.map(step => ({
        ...step,
        panelConfig: this.mergePanelConfig(step.panelConfig),
      }));
    }

    return mergedConfig;
  });

  private mergePanelConfig(
    panelConfig: IStepperPanelConfig
  ): IStepperPanelConfig {
    return {
      ...panelConfig,
      nextButtonConfig: {
        ...DEFAULT_STEPPER_NEXT_BUTTON_CONFIG,
        ...(panelConfig.nextButtonConfig ?? {}),
      },
      backButtonConfig: {
        ...DEFAULT_STEPPER_BACK_BUTTON_CONFIG,
        ...(panelConfig.backButtonConfig ?? {}),
      },
    };
  }

  ngOnInit(): void {
    this.setActiveStep();
  }

  protected setActiveStep(): void {
    const config = this.finalStepperConfig();
    if (config.activeStep) {
      this.activeStep.set(config.activeStep);
    }
  }
}
