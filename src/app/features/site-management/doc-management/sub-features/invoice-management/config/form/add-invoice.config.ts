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
import { IAddInvoiceUIFormDto } from '../../types/invoice.dto';

export const ADD_INVOICE_DEFAULT_GST_PERCENT = 18;

const ADD_INVOICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddInvoiceUIFormDto> =
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
    jmcNumber: {
      fieldType: EDataType.SELECT,
      id: 'jmcNumber',
      fieldName: 'jmcNumber',
      label: 'JMC Number',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: {
          dependsOnField: 'projectName',
          dependsOnFieldLabel: 'a project',
        },
      },
      validators: [Validators.required],
    },
    invoiceNumber: {
      fieldType: EDataType.TEXT,
      id: 'invoiceNumber',
      fieldName: 'invoiceNumber',
      label: 'Invoice Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
      },
      validators: [Validators.required],
    },
    invoiceDate: {
      fieldType: EDataType.DATE,
      id: 'invoiceDate',
      fieldName: 'invoiceDate',
      label: 'Invoice Date',
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
      label: 'Invoice Taxable Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    gstPercent: {
      fieldType: EDataType.NUMBER,
      id: 'gstPercent',
      fieldName: 'gstPercent',
      label: 'GST %',
      defaultValue: ADD_INVOICE_DEFAULT_GST_PERCENT,
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
      label: 'Invoice GST Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      readonlyInput: true,
      validators: [Validators.required, Validators.min(0)],
    },
    totalAmount: {
      fieldType: EDataType.NUMBER,
      id: 'totalAmount',
      fieldName: 'totalAmount',
      label: 'Total Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      readonlyInput: true,
      validators: [Validators.required, Validators.min(1)],
    },
    invoiceAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'invoiceAttachment',
      fieldName: 'invoiceAttachment',
      label: 'Invoice Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const ADD_INVOICE_FORM_CONFIG: IFormConfig<IAddInvoiceUIFormDto> = {
  fields: ADD_INVOICE_FORM_FIELDS_CONFIG,
};
