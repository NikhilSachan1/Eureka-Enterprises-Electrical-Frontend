import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddBookPaymentUIFormDto } from '../../types/book-payment.dto';

export const ADD_BOOK_PAYMENT_DEFAULT_GST_PERCENT = 18;
export const ADD_BOOK_PAYMENT_DEFAULT_TDS_PERCENT = 2;

const ADD_BOOK_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddBookPaymentUIFormDto> =
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
    bookingDate: {
      fieldType: EDataType.DATE,
      id: 'bookingDate',
      fieldName: 'bookingDate',
      label: 'Booking Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    taxableAmount: {
      fieldType: EDataType.NUMBER,
      id: 'taxableAmount',
      fieldName: 'taxableAmount',
      label: 'Taxable Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(0)],
    },
    gstPercentage: {
      fieldType: EDataType.NUMBER,
      id: 'gstPercentage',
      fieldName: 'gstPercentage',
      label: 'GST %',
      defaultValue: ADD_BOOK_PAYMENT_DEFAULT_GST_PERCENT,
      numberConfig: {
        mode: EInputNumberMode.Decimal,
        allowNumberFormatting: false,
        suffix: ' %',
      },
      validators: [Validators.required],
    },
    gstAmount: {
      fieldType: EDataType.NUMBER,
      id: 'gstAmount',
      fieldName: 'gstAmount',
      label: 'GST Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      readonlyInput: true,
      validators: [Validators.required, Validators.min(0)],
    },
    tdsPercentage: {
      fieldType: EDataType.NUMBER,
      id: 'tdsPercentage',
      fieldName: 'tdsPercentage',
      label: 'TDS %',
      defaultValue: ADD_BOOK_PAYMENT_DEFAULT_TDS_PERCENT,
      numberConfig: {
        mode: EInputNumberMode.Decimal,
        allowNumberFormatting: false,
        suffix: ' %',
      },
      validators: [Validators.required],
    },
    tdsDeductionAmount: {
      fieldType: EDataType.NUMBER,
      id: 'tdsDeductionAmount',
      fieldName: 'tdsDeductionAmount',
      label: 'TDS Deduction',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      readonlyInput: true,
      validators: [Validators.required, Validators.min(0)],
    },
    paymentTotalAmount: {
      fieldType: EDataType.NUMBER,
      id: 'paymentTotalAmount',
      fieldName: 'paymentTotalAmount',
      label: 'Payment Total',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      readonlyInput: true,
      validators: [Validators.required],
    },
    paymentHoldReason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'paymentHoldReason',
      fieldName: 'paymentHoldReason',
      label: 'Payment Hold Reason',
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const ADD_BOOK_PAYMENT_FORM_CONFIG: IFormConfig<IAddBookPaymentUIFormDto> =
  {
    fields: ADD_BOOK_PAYMENT_FORM_FIELDS_CONFIG,
  };
