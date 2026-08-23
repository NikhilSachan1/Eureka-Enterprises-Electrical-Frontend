import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddPaymentRequestUIFormDto } from '../../types/payment-request.dto';

const ADD_PAYMENT_REQUEST_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddPaymentRequestUIFormDto> =
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
    invoiceNumber: {
      fieldType: EDataType.SELECT,
      id: 'invoiceNumber',
      fieldName: 'invoiceNumber',
      label: 'Invoice Number',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: {
          dependsOnField: 'projectName',
          dependsOnFieldLabel: 'a project',
        },
      },
      validators: [Validators.required],
    },
    requestedAmount: {
      fieldType: EDataType.NUMBER,
      id: 'requestedAmount',
      fieldName: 'requestedAmount',
      label: 'Requested Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        minimumBoundaryValue: 0.01,
      },
      validators: [Validators.required, Validators.min(0.01)],
    },
    reason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'reason',
      fieldName: 'reason',
      label: 'Reason',
      validators: [Validators.required],
    },
  };

export const ADD_PAYMENT_REQUEST_FORM_CONFIG: IFormConfig<IAddPaymentRequestUIFormDto> =
  {
    fields: ADD_PAYMENT_REQUEST_FORM_FIELDS_CONFIG,
  };
