import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  MODULE_NAMES,
  CONFIGURATION_KEYS,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddPoUIFormDto } from '../../types/po.dto';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const ADD_PO_DEFAULT_GST_PERCENT = 18;

const ADD_PO_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddPoUIFormDto> = {
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
  contractorName: {
    fieldType: EDataType.SELECT,
    id: 'contractorName',
    fieldName: 'contractorName',
    label: 'Contractor Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.CONTRACTOR,
        dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
      },
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          return context.docContext === EDocContext.SALES;
        },
        validators: [Validators.required],
      },
    ],
  },
  vendorName: {
    fieldType: EDataType.SELECT,
    id: 'vendorName',
    fieldName: 'vendorName',
    label: 'Vendor Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VENDOR,
        dropdownName: CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
      },
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          return context.docContext === EDocContext.PURCHASE;
        },
        validators: [Validators.required],
      },
    ],
  },
  poNumber: {
    fieldType: EDataType.TEXT,
    id: 'poNumber',
    fieldName: 'poNumber',
    label: 'PO Number',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
    },
    validators: [Validators.required],
  },
  poDate: {
    fieldType: EDataType.DATE,
    id: 'poDate',
    fieldName: 'poDate',
    label: 'PO Date',
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
    label: 'PO Taxable Amount',
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
    defaultValue: ADD_PO_DEFAULT_GST_PERCENT,
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
    label: 'PO GST Amount',
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
  poAttachment: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'poAttachment',
    fieldName: 'poAttachment',
    label: 'PO Attachments',
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

export const ADD_PO_FORM_CONFIG: IFormConfig<IAddPoUIFormDto> = {
  fields: ADD_PO_FORM_FIELDS_CONFIG,
};
