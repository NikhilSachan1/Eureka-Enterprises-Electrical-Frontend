import { Validators } from '@angular/forms';
import { EDataType, IInputFieldsConfig } from '@shared/types';
import { EPaymentRecordMode } from '../../types/payment-sheet.enum';

/** Asked on Reimburse (expense / fuel) and vendor Bank Transfer: record it on a payment sheet or not. */
export const PAYMENT_RECORD_MODE_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  fieldType: EDataType.SELECT,
  id: 'recordMode',
  fieldName: 'recordMode',
  label: 'Record Payment',
  selectConfig: {
    optionsDropdown: [
      {
        label: 'With Payment Sheet',
        value: EPaymentRecordMode.PAYMENT_SHEET,
      },
      {
        label: 'Direct (no Payment Sheet)',
        value: EPaymentRecordMode.DIRECT,
      },
    ],
  },
  validators: [Validators.required],
};

/** Shown under the dropdown while Direct is selected, so the user knows before submitting. */
export const DIRECT_PAYMENT_WARNING = {
  TITLE: 'Direct entry — no payment sheet',
  MESSAGE:
    'This payment will not be added to any payment sheet. It will be recorded as a direct entry only.',
} as const;

/** Pre-selected on every form that asks. */
export const DEFAULT_PAYMENT_RECORD_MODE = EPaymentRecordMode.PAYMENT_SHEET;
