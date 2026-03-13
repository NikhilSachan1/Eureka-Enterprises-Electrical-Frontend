import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { DOC_ENTRY_ROW_FIELD_CONFIG } from './add-project-doc.config';

/** Edit form: only totalAmount, documentDate, documentNumber, attachment */
export interface IEditProjectDocUIFormDto extends Record<string, unknown> {
  totalAmount?: number;
  documentDate?: Date;
  documentNumber?: string;
  attachment?: File[];
}

const EDIT_PROJECT_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditProjectDocUIFormDto> =
  {
    totalAmount: {
      ...DOC_ENTRY_ROW_FIELD_CONFIG.totalAmount,
      validators: [Validators.required],
    },
    documentDate: {
      ...DOC_ENTRY_ROW_FIELD_CONFIG.documentDate,
      validators: [Validators.required],
    },
    documentNumber: {
      ...DOC_ENTRY_ROW_FIELD_CONFIG.documentNumber,
      validators: [Validators.required],
    },
    attachment: {
      ...DOC_ENTRY_ROW_FIELD_CONFIG.attachment,
      fileConfig: {
        fileLimit: 5,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
    },
  };

const EDIT_PROJECT_DOC_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: { ...COMMON_FORM_ACTIONS.RESET },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Document',
    tooltip: 'Update document',
  },
};

export const EDIT_PROJECT_DOC_FORM_CONFIG: IFormConfig<IEditProjectDocUIFormDto> =
  {
    fields: EDIT_PROJECT_DOC_FORM_FIELDS_CONFIG,
    buttons: EDIT_PROJECT_DOC_FORM_BUTTONS_CONFIG,
  };
