import {
  computed,
  effect,
  inject,
  signal,
  DestroyRef,
  Directive,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  buildResetAllStepsDialogConfig,
  buildResetStepDialogConfig,
} from '@shared/config/confirmation-dialog.config';
import {
  ConfirmationDialogService,
  FormService,
  NotificationService,
  LoadingService,
} from '@shared/services';
import { LoggerService } from '@core/services';
import { UnsavedChangesService } from '@core/services/unsaved-changes.service';
import { IPendingSave, IUnsavedChangesAware } from '@core/types';
import {
  EButtonActionType,
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
  >
  implements IUnsavedChangesAware, IPendingSave
{
  // ---------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------
  protected readonly formService = inject(FormService);
  protected readonly logger = inject(LoggerService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly loadingService = inject(LoadingService);
  private readonly unsavedChangesService = inject(UnsavedChangesService);
  // Uniquely named: many subclasses inject their own `confirmationDialogService`.
  private readonly resetConfirmDialogService = inject(
    ConfirmationDialogService
  );

  // ---------------------------------------------------------------------
  // State (Signals)
  // ---------------------------------------------------------------------
  protected readonly isSubmitting = signal(false);
  protected readonly activeStep = signal<number>(1);
  protected readonly stepErrors = signal<Record<number, boolean>>({});
  protected readonly stepValid = signal<Record<number, boolean>>({});
  protected readonly attemptedSteps = signal<Set<number>>(new Set());

  /** Per step: has the user changed anything there? Drives the reset buttons. */
  protected readonly stepDirty = signal<Record<number, boolean>>({});
  protected readonly anyStepDirty = computed(() =>
    Object.values(this.stepDirty()).some(Boolean)
  );

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
    this.unsavedChangesService.register(this, this.destroyRef);

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
      this.trackStepDirty(Number(stepKey), formGroup);
    });
  }

  /**
   * `events` also fires on pristine/dirty changes (a field's markAsDirty reaches the step's
   * group), so the state is right even when a value is set before the field is marked dirty.
   */
  private trackStepDirty(
    step: number,
    formGroup: IEnhancedForm<Record<string, unknown>>['formGroup']
  ): void {
    if (isNaN(step)) {
      return;
    }

    const update = (): void =>
      this.stepDirty.update(state =>
        state[step] === formGroup.dirty
          ? state
          : { ...state, [step]: formGroup.dirty }
      );

    update();
    formGroup.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(update);
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

  /** Step reset: nothing typed → nothing to do; otherwise confirm, naming the step. */
  protected onStepperResetRequested(): void {
    const step = this.activeStep();

    if (!this.stepDirty()[step]) {
      return;
    }

    this.resetConfirmDialogService.showConfirmationDialog(
      EButtonActionType.RESET,
      {
        dialogConfig: buildResetStepDialogConfig(
          this.getStepName(step),
          this.resetRestoresSavedDetails()
        ),
        onAccept: () => this.onResetParticularForm(),
      },
      null,
      false,
      false
    );
  }

  /**
   * The form-wide reset on multi-step pages. Confirms first and lists the steps that would
   * lose input; does nothing when no step was changed.
   */
  protected confirmResetMultiStepForm(
    initialData?: Partial<Record<string, Partial<T>>>
  ): void {
    const changedSteps = Object.entries(this.stepDirty())
      .filter(([, dirty]) => dirty)
      .map(([step]) => Number(step))
      .sort((a, b) => a - b);

    if (!changedSteps.length) {
      return;
    }

    this.resetConfirmDialogService.showConfirmationDialog(
      EButtonActionType.RESET,
      {
        dialogConfig: buildResetAllStepsDialogConfig(
          changedSteps.map(step => this.getStepLabel(step)),
          this.stepperConfig?.steps.length ?? changedSteps.length,
          this.resetRestoresSavedDetails()
        ),
        onAccept: () => this.onResetMultiStepForm(initialData),
      },
      null,
      false,
      false
    );
  }

  /** Edit forms override with true: their reset restores the saved details, not blank. */
  protected resetRestoresSavedDetails(): boolean {
    return false;
  }

  /** Step label as shown on the stepper, e.g. "Bank"; "Step 3" when it has none. */
  private getStepLabel(step: number): string {
    return (
      this.stepperConfig?.steps.find(stepConfig => stepConfig.value === step)
        ?.label ?? `Step ${step}`
    );
  }

  /** For sentences: "Bank step", or "Step 3" when the step has no label. */
  private getStepName(step: number): string {
    const label = this.stepperConfig?.steps.find(
      stepConfig => stepConfig.value === step
    )?.label;

    return label ? `${label} step` : `Step ${step}`;
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
    // Once the API accepts this save the form counts as saved, so leaving is not blocked.
    this.unsavedChangesService.beginSave(this);

    try {
      this.handleSubmit();
    } catch (error) {
      this.logger.error('Form submission failed', error);
      this.notificationService.error('Something went wrong');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // ---------------------------------------------------------------------
  // Unsaved changes (route guard + browser refresh warning)
  // ---------------------------------------------------------------------
  /** True when the user changed any field since the form loaded or was last saved. */
  hasUnsavedChanges(): boolean {
    return (
      this.tracksUnsavedChanges() &&
      this.allFormGroups().some(formGroup => formGroup.dirty)
    );
  }

  /** Override to return false where losing input is harmless (e.g. login). */
  protected tracksUnsavedChanges(): boolean {
    return true;
  }

  /** Clears the "changed" state after a successful save; values are kept. */
  markSaved(): void {
    this.allFormGroups().forEach(formGroup => formGroup.markAsPristine());
  }

  private allFormGroups(): IEnhancedForm<
    Record<string, unknown>
  >['formGroup'][] {
    if (this.isMultiStepForm()) {
      return Object.values(this.multiStepForm.forms)
        .map(stepForm => stepForm.formGroup)
        .filter(Boolean);
    }

    if (this.isSingleStepForm() && this.form.formGroup) {
      return [this.form.formGroup];
    }

    return [];
  }

  protected getFirstErrorStep(): number | null {
    const keys = Object.keys(this.stepErrors()).map(Number);
    return keys.find(step => this.stepErrors()[step]) ?? null;
  }

  // ---------------------------------------------------------------------
  // Abstract API
  // ---------------------------------------------------------------------
  protected abstract handleSubmit(): void;
}
