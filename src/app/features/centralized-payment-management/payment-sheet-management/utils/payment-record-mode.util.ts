import { computed, effect, Injector, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EPaymentRecordMode } from '../types/payment-sheet.enum';
import { IPaymentRecordModeState } from '../types/payment-sheet.interface';

/** Modes allowed by `APP_CONFIG.PAYMENT_RECORD_CONFIG.MODE` ('BOTH' → both, otherwise just that one). */
export function resolveAllowedRecordModes(): EPaymentRecordMode[] {
  const { MODE } = APP_CONFIG.PAYMENT_RECORD_CONFIG;
  switch (MODE) {
    case 'PAYMENT_SHEET':
      return [EPaymentRecordMode.PAYMENT_SHEET];
    case 'DIRECT':
      return [EPaymentRecordMode.DIRECT];
    default:
      return [EPaymentRecordMode.PAYMENT_SHEET, EPaymentRecordMode.DIRECT];
  }
}

/** With Payment Sheet whenever it is allowed; otherwise the one mode configured. */
export function defaultRecordMode(
  allowed: EPaymentRecordMode[] = resolveAllowedRecordModes()
): EPaymentRecordMode {
  return allowed.includes(EPaymentRecordMode.PAYMENT_SHEET)
    ? EPaymentRecordMode.PAYMENT_SHEET
    : allowed[0];
}

/**
 * Keeps a form's `recordMode` control in line with the app config: shows the dropdown only when
 * both modes are allowed, and sets the control to the default whenever its value is not allowed
 * (first load, config set to one mode, after a reset).
 */
export function bindPaymentRecordMode(params: {
  formGroup: FormGroup;
  currentValue: Signal<unknown>;
  injector: Injector;
}): IPaymentRecordModeState {
  const { formGroup, currentValue, injector } = params;
  const allowed = resolveAllowedRecordModes();
  const defaultMode = defaultRecordMode(allowed);

  effect(
    () => {
      const value = currentValue() as EPaymentRecordMode | null | undefined;
      if (!value || !allowed.includes(value)) {
        formGroup.get('recordMode')?.setValue(defaultMode);
      }
    },
    { injector }
  );

  return {
    showSelect: computed(() => allowed.length > 1),
    defaultMode: computed(() => defaultMode),
    current: computed(() => {
      const value = currentValue() as EPaymentRecordMode | null | undefined;
      return value && allowed.includes(value) ? value : defaultMode;
    }),
  };
}
