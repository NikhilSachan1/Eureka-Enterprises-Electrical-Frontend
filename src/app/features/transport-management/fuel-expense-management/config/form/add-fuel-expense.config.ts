import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES, REGEX } from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { getDateBeforeXDays, withCustomMessage } from '@shared/utility';
import { IFuelExpenseAddUIFormDto } from '../../types/fuel-expense.dto';
import { APP_CONFIG } from '@core/config';

const ADD_FUEL_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IFuelExpenseAddUIFormDto> =
  {
    fuelFillDate: {
      fieldType: EDataType.DATE,
      id: 'fuelFillDate',
      fieldName: 'fuelFillDate',
      label: 'Fuel Fill Date',
      dateConfig: {
        minDate: getDateBeforeXDays(6),
        maxDate: new Date(),
      },
      validators: [Validators.required],
    },
    odometerReading: {
      fieldType: EDataType.NUMBER,
      id: 'odometerReading',
      fieldName: 'odometerReading',
      label: 'Odometer Reading',
      numberConfig: {
        mode: EInputNumberMode.Decimal,
      },
      validators: [Validators.required],
    },
    fuelLiters: {
      fieldType: EDataType.NUMBER,
      id: 'fuelLiters',
      fieldName: 'fuelLiters',
      label: 'Fuel Liters',
      numberConfig: {
        mode: EInputNumberMode.Decimal,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      validators: [Validators.required],
    },
    fuelAmount: {
      fieldType: EDataType.NUMBER,
      id: 'fuelAmount',
      fieldName: 'fuelAmount',
      label: 'Fuel Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required],
    },
    paymentMode: {
      fieldType: EDataType.SELECT,
      id: 'paymentMode',
      fieldName: 'paymentMode',
      label: 'Payment Mode',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.FUEL_EXPENSE,
          dropdownName: CONFIGURATION_KEYS.FUEL_EXPENSE.PAYMENT_METHODS,
        },
      },
      validators: [Validators.required],
    },
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Note',
      validators: [Validators.required],
    },
    fuelExpenseAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'fuelExpenseAttachments',
      fieldName: 'fuelExpenseAttachments',
      label: 'Fuel Expense Attachments',
      fileConfig: {
        fileLimit: 2,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    transactionId: {
      fieldType: EDataType.TEXT,
      id: 'transactionId',
      fieldName: 'transactionId',
      label: 'Transaction ID / Receipt Number / UTR Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
      },
      validators: [
        Validators.minLength(6),
        Validators.maxLength(32),
        withCustomMessage(
          Validators.pattern(REGEX.ALPHANUMERIC),
          'Invalid transaction ID / Receipt Number / UTR Number'
        ),
      ],
    },
  };

const ADD_FUEL_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Fuel Expense',
    tooltip: 'Add a new fuel expense',
  },
};

export const ADD_FUEL_EXPENSE_FORM_CONFIG: IFormConfig<IFuelExpenseAddUIFormDto> =
  {
    fields: ADD_FUEL_EXPENSE_FORM_FIELDS_CONFIG,
    buttons: ADD_FUEL_EXPENSE_FORM_BUTTONS_CONFIG,
  };
