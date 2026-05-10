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
import { IAddJmcUIFormDto } from '../../types/jmc.dto';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const ADD_JMC_DEFAULT_GST_PERCENT = 5;

const ADD_JMC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddJmcUIFormDto> = {
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
        moduleName: MODULE_NAMES.CONTRACTOR,
        dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
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
  jmcNumber: {
    fieldType: EDataType.TEXT,
    id: 'jmcNumber',
    fieldName: 'jmcNumber',
    label: 'JMC Number',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
    },
    validators: [Validators.required],
  },
  jmcDate: {
    fieldType: EDataType.DATE,
    id: 'jmcDate',
    fieldName: 'jmcDate',
    label: 'JMC Date',
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
    label: 'JMC Taxable Amount',
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
    defaultValue: ADD_JMC_DEFAULT_GST_PERCENT,
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
    label: 'JMC GST Amount',
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
  jmcAttachment: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'jmcAttachment',
    fieldName: 'jmcAttachment',
    label: 'JMC Attachments',
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

export const ADD_JMC_FORM_CONFIG: IFormConfig<IAddJmcUIFormDto> = {
  fields: ADD_JMC_FORM_FIELDS_CONFIG,
};
