import { effect, inject, signal, DestroyRef, Directive } from '@angular/core';
import {
  FormService,
  NotificationService,
  LoadingService,
} from '@shared/services';
import { LoggerService, EnvironmentService } from '@core/services';
import {
  IEnhancedMultiStepForm,
  IEnhancedForm,
  ITrackedForm,
  IStepperConfig,
} from '@shared/types';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

@Directive()
export abstract class FormBase<
  T extends Record<string, unknown> = Record<string, unknown>,
  TSingle extends Record<string, unknown> = T,
> {
  // ---------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------
  protected readonly formService = inject(FormService);
  protected readonly logger = inject(LoggerService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly environmentService = inject(EnvironmentService);
  protected readonly loadingService = inject(LoadingService);

  // ---------------------------------------------------------------------
  // State (Signals)
  // ---------------------------------------------------------------------
  protected readonly isSubmitting = signal(false);
  protected readonly activeStep = signal<number>(1);
  protected readonly stepErrors = signal<Record<number, boolean>>({});
  protected readonly stepValid = signal<Record<number, boolean>>({});
  protected readonly attemptedSteps = signal<Set<number>>(new Set());

  // ---------------------------------------------------------------------
  // Multi-step form (optional)
  // ---------------------------------------------------------------------
  protected stepperConfig!: IStepperConfig;
  private _multiStepForm!: IEnhancedMultiStepForm<T>;
  protected trackForms!: Record<string, ITrackedForm>;

  protected get multiStepForm(): IEnhancedMultiStepForm<T> {
    return this._multiStepForm;
  }

  protected set multiStepForm(value: IEnhancedMultiStepForm<T>) {
    this._multiStepForm = value;
    if (
      value &&
      (!this.trackForms || Object.keys(this.trackForms).length === 0)
    ) {
      this.initializeTrackForms();
    }
  }

  // ---------------------------------------------------------------------
  // Single-step form (optional)
  // ---------------------------------------------------------------------
  protected form!: IEnhancedForm<TSingle>;
  // ---------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------
  constructor() {
    effect(() => {
      this.attemptedSteps();

      if (!this.trackForms || Object.keys(this.trackForms).length === 0) {
        return;
      }

      Object.values(this.trackForms).forEach(form => {
        form.isValid();
        form.isInvalid();
      });

      this.updateValidationStates();
    });
  }

  // ---------------------------------------------------------------------
  // Form type helpers
  // ---------------------------------------------------------------------
  protected isMultiStepForm(): boolean {
    return !!this.multiStepForm;
  }

  protected isSingleStepForm(): boolean {
    return !!this.form;
  }

  protected initializeTrackForms(): void {
    if (
      !this.multiStepForm ||
      (this.trackForms && Object.keys(this.trackForms).length > 0)
    ) {
      return;
    }

    this.trackForms = {};
    Object.keys(this.multiStepForm.forms).forEach(stepKey => {
      const { formGroup } = this.multiStepForm.forms[stepKey];
      this.trackForms[stepKey] = this.formService.trackFormChanges(
        formGroup,
        this.destroyRef
      );
    });
  }

  // ---------------------------------------------------------------------
  // Validation helpers
  // ---------------------------------------------------------------------
  protected markAllStepsAsAttempted(): void {
    const steps = Object.keys(this.multiStepForm.forms)
      .map(Number)
      .filter(step => !isNaN(step));

    this.attemptedSteps.update(prev => {
      const next = new Set(prev);
      steps.forEach(step => next.add(step));
      return next;
    });

    this.updateValidationStates();
  }

  protected updateValidationStates(): void {
    if (this.isSubmitting() || !this.trackForms) {
      return;
    }

    const errors: Record<number, boolean> = {};
    const valid: Record<number, boolean> = {};
    const attempted = this.attemptedSteps();

    Object.entries(this.trackForms).forEach(([key, form]) => {
      const step = Number(key);
      if (!isNaN(step) && attempted.has(step)) {
        errors[step] = form.isInvalid();
        valid[step] = form.isValid();
      }
    });

    this.stepErrors.set(errors);
    this.stepValid.set(valid);
  }

  protected validateForm(): boolean {
    if (this.isMultiStepForm()) {
      return this.validateMultiStepForm();
    }

    if (this.isSingleStepForm()) {
      return this.validateSingleStepForm();
    }

    return false;
  }

  protected validateMultiStepForm(): boolean {
    if (!this.multiStepForm.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Multi-step form validation failed');
      return false;
    }
    return true;
  }

  protected validateSingleStepForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Single-step form validation failed');
      return false;
    }
    return true;
  }

  protected validateParticularForm(): boolean {
    const form = this.multiStepForm.forms[this.activeStep()];
    if (!form.validateAndMarkTouched()) {
      this.logger.warn(`Validation failed for step ${this.activeStep()}`);
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------
  // Stepper handlers
  // ---------------------------------------------------------------------
  protected onStepperNextRequested(): void {
    const current = this.activeStep();
    this.attemptedSteps.update(s => new Set(s).add(current));

    this.validateParticularForm();
    this.updateValidationStates();
    const isLast = current === this.stepperConfig.steps.length;
    this.activeStep.set(isLast ? 1 : current + 1);
  }

  protected onStepperPreviousRequested(): void {
    const current = this.activeStep();
    this.attemptedSteps.update(s => new Set(s).add(current));
    this.validateParticularForm();
    this.updateValidationStates();
    this.activeStep.set(Math.max(1, current - 1));
  }

  protected onStepperResetRequested(): void {
    this.onResetParticularForm();
  }

  protected onResetParticularForm(initialData?: Partial<T>): void {
    try {
      const form = this.multiStepForm.forms[this.activeStep()];
      form.reset(initialData ?? undefined);
    } catch (error) {
      this.logger.error('Error resetting step form', error);
    }
  }

  protected onResetMultiStepForm(
    initialData?: Partial<Record<string, Partial<T>>>
  ): void {
    try {
      this.multiStepForm.reset(initialData ?? undefined);
    } catch (error) {
      this.logger.error('Error resetting multi-step form', error);
    }
  }

  protected onResetSingleForm(initialData?: Partial<TSingle>): void {
    try {
      this.form.reset(initialData ?? undefined);
    } catch (error) {
      this.logger.error('Error resetting single form', error);
    }
  }

  // ---------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------
  protected onSubmit(): void {
    if (this.isMultiStepForm()) {
      this.markAllStepsAsAttempted();
    }

    if (this.isSubmitting() || !this.validateForm()) {
      if (this.isMultiStepForm()) {
        const errorStep = this.getFirstErrorStep();
        if (errorStep !== null) {
          this.activeStep.set(errorStep);
        }
      }
      return;
    }

    this.isSubmitting.set(true);

    try {
      this.handleSubmit();
    } catch (error) {
      this.logger.error('Form submission failed', error);
      this.notificationService.error('Something went wrong');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected getFirstErrorStep(): number | null {
    const keys = Object.keys(this.stepErrors()).map(Number);
    return keys.find(step => this.stepErrors()[step]) ?? null;
  }

  /**
   * Load mock data into the form if test data is enabled
   * Automatically detects whether to use multi-step or single form based on what's initialized
   * @param mockData - Mock data to load into the form
   */
  protected loadMockData(
    mockData: Partial<Record<string, Partial<T>>> | Partial<TSingle>
  ): void {
    if (!this.environmentService.isTestDataEnabled) {
      return;
    }

    try {
      if (this.isMultiStepForm() && this.multiStepForm) {
        this.multiStepForm.patch(
          mockData as Partial<Record<string, Partial<T>>>
        );
        this.logger.logUserAction('Mock data loaded into multi-step form');
      } else if (this.isSingleStepForm() && this.form) {
        this.form.patch(mockData as Partial<TSingle>);
        this.logger.logUserAction('Mock data loaded into single form');
      }
    } catch (error) {
      this.logger.error('Error loading mock data', error);
    }
  }

  // ---------------------------------------------------------------------
  // Abstract API
  // ---------------------------------------------------------------------
  protected abstract handleSubmit(): void;
}
