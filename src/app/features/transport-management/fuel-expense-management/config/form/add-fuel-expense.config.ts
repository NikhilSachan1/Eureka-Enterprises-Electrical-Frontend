import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IFuelExpenseAddUIFormDto } from '../../types/fuel-expense.dto';
import { APP_CONFIG } from '@core/config';

const ADD_FUEL_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IFuelExpenseAddUIFormDto> =
  {
    employeeName: {
      fieldType: EDataType.SELECT,
      id: 'employeeName',
      fieldName: 'employeeName',
      label: 'Employee',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          employeeStatusFilter: ['ACTIVE'],
        },
        showClearButton: false,
      },
    },
    fuelFillDate: {
      fieldType: EDataType.DATE,
      id: 'fuelFillDate',
      fieldName: 'fuelFillDate',
      label: 'Fuel Fill Date',
      dateConfig: {
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
        filterOptions: {
          exclude: ['cheque', 'neft/imps', 'system', 'rtgs'],
        },
      },
      validators: [Validators.required],
    },
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Note',
    },
    fuelExpenseAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'fuelExpenseAttachments',
      fieldName: 'fuelExpenseAttachments',
      label: 'Fuel Expense Attachments',
      hint: 'Upload 3 photos: 1 fuel payment receipt, 1 odometer reading, and 1 pump image.',
      fileConfig: {
        fileLimit: 5,
        minFileLimit: 3,
        maxFileSize: 1024 * 1024 * 20,
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
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
        maximumInputLength: 32,
      },
      validators: [Validators.minLength(6), Validators.maxLength(32)],
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
