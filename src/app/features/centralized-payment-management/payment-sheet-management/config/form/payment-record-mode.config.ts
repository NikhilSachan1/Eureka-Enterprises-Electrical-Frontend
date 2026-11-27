import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  defineConfigurationValue,
  enumValueParser,
} from '@shared/services/app-configuration/configuration-value.parsers';
import { EDataType, IInputFieldsConfig } from '@shared/types';
import {
  EPaymentRecordConfigMode,
  EPaymentRecordMode,
} from '../../types/payment-sheet.enum';
import {
  defaultRecordMode,
  resolveAllowedRecordModes,
} from '../../utils/payment-record-mode.util';

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

/**
 * `payments.record_mode` (backend Configurations, text): DIRECT | PAYMENT_SHEET | BOTH.
 * Missing / unknown → DIRECT. Read with `AppConfigurationService.configurationValue(...)`.
 */
export const PAYMENT_RECORD_MODE_CONFIG_VALUE = defineConfigurationValue({
  moduleName: MODULE_NAMES.PAYMENTS,
  key: CONFIGURATION_KEYS.PAYMENTS.RECORD_MODE,
  fallback: EPaymentRecordConfigMode.DIRECT,
  parse: enumValueParser(EPaymentRecordConfigMode),
});

/**
 * Form's starting value before `payments.record_mode` loads — the config default (DIRECT). The
 * form switches to the configured mode as soon as it arrives.
 */
export const DEFAULT_PAYMENT_RECORD_MODE = defaultRecordMode(
  resolveAllowedRecordModes(EPaymentRecordConfigMode.DIRECT)
);
