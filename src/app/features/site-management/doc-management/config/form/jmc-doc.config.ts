import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { TEXT_INPUT_ACCEPT_STRIP } from '@shared/constants';
import {
  IFormInputFieldsConfig,
  EDataType,
  ETextCase,
  IFormConfig,
} from '@shared/types';
import { IJmcDocAddFormDto } from '../../types/doc.dto';

const JMC_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IJmcDocAddFormDto> = {
  poNumber: {
    fieldType: EDataType.SELECT,
    id: 'poNumber',
    fieldName: 'poNumber',
    label: 'PO Number',
    validators: [Validators.required],
  },
  jmcNumber: {
    fieldType: EDataType.TEXT,
    id: 'jmcNumber',
    fieldName: 'jmcNumber',
    label: 'JMC Number',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
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
  jmcAttachments: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'jmcAttachments',
    fieldName: 'jmcAttachments',
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
  jmcRemark: {
    fieldType: EDataType.TEXT_AREA,
    id: 'jmcRemark',
    fieldName: 'jmcRemark',
    label: 'JMC Remark',
  },
};

export const JMC_DOC_FORM_CONFIG: IFormConfig<IJmcDocAddFormDto> = {
  fields: JMC_DOC_FORM_FIELDS_CONFIG,
};
