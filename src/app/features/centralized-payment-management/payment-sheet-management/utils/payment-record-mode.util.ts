import { computed, effect, Injector, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IOptionDropdown } from '@shared/types';
import { EPaymentRecordMode } from '../types/payment-sheet.enum';
import { IPaymentRecordModeState } from '../types/payment-sheet.interface';

const ALL_MODES = Object.values(EPaymentRecordMode);

/**
 * Modes allowed by the `payments.record_modes` config. Not loaded / empty / unreadable → both, so a
 * missing config never hides the choice or blocks the form.
 */
export function resolveAllowedRecordModes(
  options: IOptionDropdown[]
): EPaymentRecordMode[] {
  const allowed = options
    .map(option => option.value)
    .filter((value): value is EPaymentRecordMode =>
      ALL_MODES.includes(value as EPaymentRecordMode)
    );
  return allowed.length ? allowed : ALL_MODES;
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
 * Keeps a form's `recordMode` control in line with the config: shows the dropdown only when more
 * than one mode is allowed, and sets the control to the default whenever its value is not allowed
 * (first load, config narrowed to one mode, after a reset).
 */
export function bindPaymentRecordMode(params: {
  formGroup: FormGroup;
  configuredModes: Signal<IOptionDropdown[]>;
  currentValue: Signal<unknown>;
  injector: Injector;
}): IPaymentRecordModeState {
  const { formGroup, configuredModes, currentValue, injector } = params;
  const allowed = computed(() => resolveAllowedRecordModes(configuredModes()));
  const defaultMode = computed(() => defaultRecordMode(allowed()));

  effect(
    () => {
      const value = currentValue() as EPaymentRecordMode | null | undefined;
      const modes = allowed();
      if (!value || !modes.includes(value)) {
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
