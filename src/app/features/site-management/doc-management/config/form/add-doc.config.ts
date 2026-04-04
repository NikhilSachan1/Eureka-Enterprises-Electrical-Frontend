import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  EInputNumberMode,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { APP_CONFIG } from '@core/config';
import { IDocAddUIFormDto } from '../../types/doc.dto';

const ADD_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDocAddUIFormDto> = {
  documentType: {
    id: 'documentType',
    fieldName: 'documentType',
    label: 'Document Type',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.PROJECT,
        dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_TYPES,
      },
    },
    validators: [Validators.required],
  },
  documentNumber: {
    id: 'documentNumber',
    fieldName: 'documentNumber',
    label: 'Document Number',
    fieldType: EDataType.TEXT,
  },
  amount: {
    fieldType: EDataType.NUMBER,
    id: 'amount',
    fieldName: 'amount',
    label: 'Amount',
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    validators: [Validators.required, Validators.min(1)],
  },
  documentDate: {
    fieldType: EDataType.DATE,
    id: 'documentDate',
    fieldName: 'documentDate',
    label: 'Document Date',
    dateConfig: {
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  documentAttachments: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'documentAttachments',
    fieldName: 'documentAttachments',
    label: 'Document Attachments',
    fileConfig: {
      fileLimit: 2,
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
    validators: [Validators.required],
  },
};

const ADD_DOC_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Doc',
    tooltip: 'Add a new Doc',
  },
};

export const ADD_DOC_FORM_CONFIG: IFormConfig<IDocAddUIFormDto> = {
  fields: ADD_DOC_FORM_FIELDS_CONFIG,
  buttons: ADD_DOC_FORM_BUTTONS_CONFIG,
};
