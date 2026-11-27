import { computed, effect, Injector, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  EPaymentRecordConfigMode,
  EPaymentRecordMode,
} from '../types/payment-sheet.enum';
import { IPaymentRecordModeState } from '../types/payment-sheet.interface';

/** Modes the `payments.record_mode` config allows: BOTH → both, otherwise just that one. */
export function resolveAllowedRecordModes(
  configMode: EPaymentRecordConfigMode
): EPaymentRecordMode[] {
  switch (configMode) {
    case EPaymentRecordConfigMode.PAYMENT_SHEET:
      return [EPaymentRecordMode.PAYMENT_SHEET];
    case EPaymentRecordConfigMode.BOTH:
      return [EPaymentRecordMode.PAYMENT_SHEET, EPaymentRecordMode.DIRECT];
    default:
      return [EPaymentRecordMode.DIRECT];
  }
}

/** With Payment Sheet whenever it is allowed; otherwise the one mode configured. */
export function defaultRecordMode(
  allowed: EPaymentRecordMode[]
): EPaymentRecordMode {
  return allowed.includes(EPaymentRecordMode.PAYMENT_SHEET)
    ? EPaymentRecordMode.PAYMENT_SHEET
    : allowed[0];
}

/**
 * Keeps a form's `recordMode` control in line with the config: shows the dropdown only for BOTH,
 * and sets the control to the default whenever its value is not allowed (first load, config value
 * arriving, after a reset).
 */
export function bindPaymentRecordMode(params: {
  formGroup: FormGroup;
  configMode: Signal<EPaymentRecordConfigMode>;
  currentValue: Signal<unknown>;
  injector: Injector;
}): IPaymentRecordModeState {
  const { formGroup, configMode, currentValue, injector } = params;
  const allowed = computed(() => resolveAllowedRecordModes(configMode()));
  const defaultMode = computed(() => defaultRecordMode(allowed()));

  effect(
    () => {
      const value = currentValue() as EPaymentRecordMode | null | undefined;
      if (!value || !allowed().includes(value)) {
        formGroup.get('recordMode')?.setValue(defaultMode());
      }
    },
    { injector }
  );

  return {
    showSelect: computed(() => allowed().length > 1),
    defaultMode,
    current: computed(() => {
      const value = currentValue() as EPaymentRecordMode | null | undefined;
      return value && allowed().includes(value) ? value : defaultMode();
    }),
  };
}
