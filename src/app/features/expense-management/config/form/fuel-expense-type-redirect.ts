import { DestroyRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICONS } from '@shared/constants';
import {
  FormDataConstraint,
  IFormConfig,
  IOptionDropdown,
} from '@shared/types';

/** Not a real expense category. Selecting it opens the matching fuel form. */
export const FUEL_EXPENSE_TYPE_REDIRECT = '__fuel_redirect__';

const FUEL_EXPENSE_PREFILL_STATE_KEY = 'fuelExpensePrefill';

export interface IFuelExpenseFormPrefill {
  fuelFillDate?: string;
  paymentMode?: string;
  fuelAmount?: number;
  transactionId?: string;
  remark?: string;
  employeeName?: string;
}

const FUEL_EXPENSE_TYPE_OPTION: IOptionDropdown = {
  label: 'Fuel',
  value: FUEL_EXPENSE_TYPE_REDIRECT,
  icon: ICONS.FUEL.MENU,
};

export function withFuelExpenseTypeOption<
  T extends FormDataConstraint & { expenseCategory: unknown },
>(config: IFormConfig<T>): IFormConfig<T> {
  const category = config.fields.expenseCategory;
  if (!category?.selectConfig) {
    return config;
  }

  return {
    ...config,
    fields: {
      ...config.fields,
      expenseCategory: {
        ...category,
        selectConfig: {
          ...category.selectConfig,
          optionsDropdown: [
            ...(category.selectConfig.optionsDropdown ?? []),
            FUEL_EXPENSE_TYPE_OPTION,
          ],
        },
      },
    },
  };
}

export function watchFuelExpenseTypeRedirect(
  formGroup: FormGroup,
  destroyRef: DestroyRef,
  onFuelSelected: (prefill: IFuelExpenseFormPrefill) => void
): void {
  const control = formGroup.get('expenseCategory');
  control?.valueChanges
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(value => {
      if (value !== FUEL_EXPENSE_TYPE_REDIRECT) {
        return;
      }
      const prefill = collectFuelExpenseFormPrefill(formGroup);
      control.setValue(null, { emitEvent: false });
      onFuelSelected(prefill);
    });
}

export function fuelExpensePrefillNavigationState(
  prefill: IFuelExpenseFormPrefill
): Record<string, unknown> {
  return { [FUEL_EXPENSE_PREFILL_STATE_KEY]: prefill };
}

/** Reads the handoff once, then drops it so a refresh does not overwrite later edits. */
export function fuelExpensePrefillFormDefaults(
  prefill: IFuelExpenseFormPrefill | null
): {
  fuelFillDate?: Date;
  paymentMode?: string;
  fuelAmount?: number;
  transactionId?: string;
  remark?: string;
  employeeName?: string;
} {
  if (!prefill) {
    return {};
  }

  const defaults: {
    fuelFillDate?: Date;
    paymentMode?: string;
    fuelAmount?: number;
    transactionId?: string;
    remark?: string;
    employeeName?: string;
  } = {};

  if (prefill.fuelFillDate) {
    const date = new Date(prefill.fuelFillDate);
    if (!Number.isNaN(date.getTime())) {
      defaults.fuelFillDate = date;
    }
  }
  if (prefill.paymentMode) {
    defaults.paymentMode = prefill.paymentMode;
  }
  if (prefill.fuelAmount !== undefined) {
    defaults.fuelAmount = prefill.fuelAmount;
  }
  if (prefill.transactionId) {
    defaults.transactionId = prefill.transactionId;
  }
  if (prefill.remark) {
    defaults.remark = prefill.remark;
  }
  if (prefill.employeeName) {
    defaults.employeeName = prefill.employeeName;
  }

  return defaults;
}

export function takeFuelExpenseFormPrefill(): IFuelExpenseFormPrefill | null {
  const state = history.state as Record<string, unknown> | null;
  const raw = state?.[FUEL_EXPENSE_PREFILL_STATE_KEY];
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const nextState = { ...state };
  delete nextState[FUEL_EXPENSE_PREFILL_STATE_KEY];
  history.replaceState(nextState, '');

  return raw as IFuelExpenseFormPrefill;
}

function collectFuelExpenseFormPrefill(
  formGroup: FormGroup
): IFuelExpenseFormPrefill {
  const raw = formGroup.getRawValue() as Record<string, unknown>;
  const prefill: IFuelExpenseFormPrefill = {};

  const expenseDate = toDate(raw['expenseDate']);
  if (expenseDate) {
    prefill.fuelFillDate = expenseDate.toISOString();
  }

  if (typeof raw['paymentMode'] === 'string' && raw['paymentMode'].trim()) {
    prefill.paymentMode = raw['paymentMode'];
  }

  if (
    raw['expenseAmount'] !== null &&
    raw['expenseAmount'] !== '' &&
    raw['expenseAmount'] !== undefined
  ) {
    const amount = Number(raw['expenseAmount']);
    if (Number.isFinite(amount)) {
      prefill.fuelAmount = amount;
    }
  }

  if (typeof raw['transactionId'] === 'string' && raw['transactionId'].trim()) {
    prefill.transactionId = raw['transactionId'].trim().toUpperCase();
  }

  if (typeof raw['remark'] === 'string' && raw['remark'].trim()) {
    prefill.remark = raw['remark'];
  }

  if (typeof raw['employeeName'] === 'string' && raw['employeeName'].trim()) {
    prefill.employeeName = raw['employeeName'];
  }

  return prefill;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}
