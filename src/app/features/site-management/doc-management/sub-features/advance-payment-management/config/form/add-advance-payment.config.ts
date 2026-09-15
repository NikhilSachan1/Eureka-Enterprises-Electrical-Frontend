import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddAdvancePaymentUIFormDto } from '../../types/advance-payment.dto';

const ADD_ADVANCE_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddAdvancePaymentUIFormDto> =
  {
    projectName: {
      fieldType: EDataType.SELECT,
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        },
      },
      validators: [Validators.required],
    },
    poNumber: {
      fieldType: EDataType.SELECT,
      id: 'poNumber',
      fieldName: 'poNumber',
      label: 'PO Name',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: {
          dependsOnField: 'projectName',
          dependsOnFieldLabel: 'a project',
        },
      },
      validators: [Validators.required],
    },
    vendorAdvanceNumber: {
      fieldType: EDataType.TEXT,
      id: 'vendorAdvanceNumber',
      fieldName: 'vendorAdvanceNumber',
      label: 'Advance Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
      },
      validators: [Validators.required],
    },
    advanceDate: {
      fieldType: EDataType.DATE,
      id: 'advanceDate',
      fieldName: 'advanceDate',
      label: 'Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    amount: {
      fieldType: EDataType.NUMBER,
      id: 'amount',
      fieldName: 'amount',
      label: 'Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        minimumBoundaryValue: 0.01,
      },
      validators: [Validators.required, Validators.min(0.01)],
    },
    advanceAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'advanceAttachment',
      fieldName: 'advanceAttachment',
      label: 'Attachment',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
  };

export const ADD_ADVANCE_PAYMENT_FORM_CONFIG: IFormConfig<IAddAdvancePaymentUIFormDto> =
  {
    fields: ADD_ADVANCE_PAYMENT_FORM_FIELDS_CONFIG,
  };
