import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
  TemplateRef,
  model,
  OnInit,
  signal,
  HostListener,
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
  DEFAULT_STEPPER_RESET_BUTTON_CONFIG,
} from '@shared/config';
import { ButtonComponent } from '../button/button.component';
import { EStepperOrientation } from '@shared/types';
import { ICONS } from '@shared/constants';

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
  stepErrors = input<Record<number, boolean>>({});
  stepValid = input<Record<number, boolean>>({});

  activeStep = model<number>(1);

  nextStepRequested = output<void>();
  previousStepRequested = output<void>();
  resetRequested = output<void>();

  // Icon constants for template
  protected readonly ICONS = ICONS;

  protected readonly ALL_STEPPER_ORIENTATIONS = EStepperOrientation;
  protected readonly isMobile = signal(window.innerWidth <= 1024);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth <= 1024);
  }

  protected readonly finalStepperConfig = computed(() => {
    const config = this.stepperConfig();
    const mobile = this.isMobile();

    if (!config || Object.keys(config).length === 0) {
      const defaultConfig = {
        ...DEFAULT_STEPPER_CONFIG,
        orientation: mobile
          ? EStepperOrientation.VERTICAL
          : DEFAULT_STEPPER_CONFIG.orientation,
      } as IStepperConfig;
      return defaultConfig;
    }

    const mergedConfig = {
      ...DEFAULT_STEPPER_CONFIG,
      ...config,
      // Override orientation based on screen size
      orientation: mobile
        ? EStepperOrientation.VERTICAL
        : (config.orientation ?? DEFAULT_STEPPER_CONFIG.orientation),
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
      resetButtonConfig: {
        ...DEFAULT_STEPPER_RESET_BUTTON_CONFIG,
        ...(panelConfig.resetButtonConfig ?? {}),
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

  protected handleNextStep(): void {
    this.nextStepRequested.emit();
  }

  protected handlePreviousStep(): void {
    this.previousStepRequested.emit();
  }

  protected handleReset(): void {
    this.resetRequested.emit();
  }
}
