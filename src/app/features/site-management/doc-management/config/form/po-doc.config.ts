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
import { IPoDocAddUIFormDto } from '../../types/doc.dto';

const PO_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IPoDocAddUIFormDto> = {
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
    validators: [Validators.required],
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
  poTaxableAmount: {
    fieldType: EDataType.NUMBER,
    id: 'poTaxableAmount',
    fieldName: 'poTaxableAmount',
    label: 'PO Taxable Amount',
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    validators: [Validators.required, Validators.min(1)],
  },
  poGstAmount: {
    fieldType: EDataType.NUMBER,
    id: 'poGstAmount',
    fieldName: 'poGstAmount',
    label: 'PO GST Amount',
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    readonlyInput: true,
    validators: [Validators.required, Validators.min(0)],
  },
  poTotalAmount: {
    fieldType: EDataType.NUMBER,
    id: 'poTotalAmount',
    fieldName: 'poTotalAmount',
    label: 'PO Total Amount',
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    readonlyInput: true,
    validators: [Validators.required, Validators.min(1)],
  },
  poAttachments: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'poAttachments',
    fieldName: 'poAttachments',
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
  poRemark: {
    fieldType: EDataType.TEXT_AREA,
    id: 'poRemark',
    fieldName: 'poRemark',
    label: 'PO Remark',
  },
};

export const PO_DOC_FORM_CONFIG: IFormConfig<IPoDocAddUIFormDto> = {
  fields: PO_DOC_FORM_FIELDS_CONFIG,
};
