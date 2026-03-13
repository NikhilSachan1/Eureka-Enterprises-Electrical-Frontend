import { COMMON_FORM_ACTIONS } from '@shared/config';
import { EDataType, IFormButtonConfig } from '@shared/types';
import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import type { IInputFieldsConfig } from '@shared/types/form/input-fields-config.interface';

export const DOC_TYPES = [
  { label: 'PO', value: 'PO' },
  { label: 'Invoice', value: 'INVOICE' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Work Order', value: 'WORK_ORDER' },
  { label: 'Completion Certificate', value: 'COMPLETION_CERTIFICATE' },
  { label: 'Other', value: 'OTHER' },
] as const;

/** Multi-select for document types */
export const DOC_TYPES_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  fieldType: EDataType.MULTI_SELECT,
  id: 'documentTypes',
  fieldName: 'documentTypes',
  label: 'Document Types',
  multiSelectConfig: {
    optionsDropdown: [...DOC_TYPES],
    optionLabel: 'label',
    optionValue: 'value',
  },
  validators: [Validators.required],
};

/** Per-document row: totalAmount, documentDate, documentNumber, attachment */
export const DOC_ENTRY_ROW_FIELD_CONFIG = {
  totalAmount: {
    fieldType: EDataType.NUMBER,
    id: 'totalAmount',
    fieldName: 'totalAmount',
    label: 'Total Amount',
    numberConfig: { allowNumberFormatting: true },
    validators: [Validators.required],
  },
  documentDate: {
    fieldType: EDataType.DATE,
    id: 'documentDate',
    fieldName: 'documentDate',
    label: 'Document Date',
    validators: [Validators.required],
  },
  documentNumber: {
    fieldType: EDataType.TEXT,
    id: 'documentNumber',
    fieldName: 'documentNumber',
    label: 'Document Number',
    validators: [Validators.required],
  },
  attachment: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'attachment',
    fieldName: 'attachment',
    label: 'Attachment',
    fileConfig: {
      fileLimit: 5,
      acceptFileTypes: [
        ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
        ...APP_CONFIG.MEDIA_CONFIG.PDF,
      ],
    },
    // Optional for now
  },
} satisfies Record<string, Partial<IInputFieldsConfig>>;

/** UI form DTO */
export interface IAddProjectDocUIFormDto extends Record<string, unknown> {
  documentTypes?: string[];
  documentEntries?: {
    docType: string;
    totalAmount?: number;
    documentDate?: Date;
    documentNumber?: string;
    attachment?: File[];
  }[];
}

const ADD_PROJECT_DOC_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: { ...COMMON_FORM_ACTIONS.RESET },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Documents',
    tooltip: 'Add documents',
  },
};

export const ADD_PROJECT_DOC_FORM_CONFIG = {
  buttons: ADD_PROJECT_DOC_FORM_BUTTONS_CONFIG,
};
