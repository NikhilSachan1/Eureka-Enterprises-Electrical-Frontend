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
import { IStepperConfig } from '@shared/types/stepper/stepper.interface';
import { DEFAULT_STEPPER_CONFIG } from '@shared/config';
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

    return {
      ...DEFAULT_STEPPER_CONFIG,
      ...config,
    } as IStepperConfig;
  });

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
