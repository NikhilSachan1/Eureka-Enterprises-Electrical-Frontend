import {
  ChangeDetectionStrategy,
  Component,
  signal,
  OnInit,
  inject,
  computed,
  Signal,
  DestroyRef,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { StepperComponent } from '@shared/components/stepper/stepper.component';
import { IStepperConfig } from '@shared/types/stepper/stepper.interface';
import {
  ADD_EMPLOYEE_FORM_CONFIG,
  ADD_EMPLOYEE_STEPPER_CONFIG,
} from '@features/employee-management/configs';
import { FormService, NotificationService } from '@shared/services';
import { IPageHeaderConfig, IEnhancedMultiStepForm } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { INDIA_CITY_DATA } from '@shared/config/static-data.config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoggerService } from '@core/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

@Component({
  selector: 'app-add-employee',
  imports: [
    StepperComponent,
    ReactiveFormsModule,
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEmployeeComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected stepperConfig!: IStepperConfig;
  protected multiStepForm!: IEnhancedMultiStepForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly activeStep = signal<number>(1);

  protected readonly stepErrors = signal<Record<number, boolean>>({});
  protected readonly stepValid = signal<Record<number, boolean>>({});

  constructor() {
    effect(() => {
      if (this.multiStepForm?.forms) {
        Object.keys(this.multiStepForm.forms).forEach(stepKey => {
          const { formGroup } = this.multiStepForm.forms[stepKey];

          merge(formGroup.statusChanges, formGroup.valueChanges)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.updateValidationStates());
        });
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected trackFields!: Record<string, Signal<any>>;

  ngOnInit(): void {
    this.stepperConfig = ADD_EMPLOYEE_STEPPER_CONFIG;
    this.multiStepForm = this.formService.createMultiStepForm(
      ADD_EMPLOYEE_FORM_CONFIG
    );
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.multiStepForm.getData();
    this.logger.logUserAction('Add Employee Form Data', formData);
  }

  protected onStateChange(): void {
    const selectedState = this.trackFields['state']();
    const cities = selectedState ? (INDIA_CITY_DATA[selectedState] ?? []) : [];
    const { selectConfig } =
      this.multiStepForm.forms['1'].fieldConfigs['city'] ?? {};
    if (selectConfig) {
      selectConfig.optionsDropdown = cities;
    }
  }

  protected onStepperNextRequested(): void {
    this.validateParticularForm();
    this.activeStep.set(this.activeStep() + 1);
  }

  protected onStepperPreviousRequested(): void {
    this.validateParticularForm();
    this.activeStep.set(this.activeStep() - 1);
  }

  protected onStepperResetRequested(): void {
    this.onResetParticularForm();
  }

  private updateValidationStates(): void {
    const errors: Record<number, boolean> = {};
    const valid: Record<number, boolean> = {};

    if (this.multiStepForm?.forms) {
      Object.keys(this.multiStepForm.forms).forEach(stepKey => {
        const stepNumber = Number(stepKey);
        if (!isNaN(stepNumber)) {
          const { formGroup } = this.multiStepForm.forms[stepKey];
          const isTouched = formGroup.touched;
          errors[stepNumber] = formGroup.invalid && isTouched;
          valid[stepNumber] = formGroup.valid && isTouched;
        }
      });
    }

    this.stepErrors.set(errors);
    this.stepValid.set(valid);
  }

  private validateForm(): boolean {
    if (!this.multiStepForm.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Add employee form validation failed');
      return false;
    }
    return true;
  }

  private validateParticularForm(): boolean {
    const form = this.multiStepForm.forms[this.activeStep()];
    if (!form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn(`Form validation failed for '${this.activeStep()}'`);
      return false;
    }

    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Employee Form');
      this.multiStepForm.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private onResetParticularForm(): void {
    try {
      this.logger.logUserAction(
        `Reset Add Employee Form for step ${this.activeStep()}`
      );
      const form = this.multiStepForm.forms[this.activeStep()];
      form.reset();
    } catch (error) {
      this.logger.error(
        `Error resetting form for step ${this.activeStep()}`,
        error
      );
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Employee',
      subtitle: 'Add a new employee',
    };
  }
}
