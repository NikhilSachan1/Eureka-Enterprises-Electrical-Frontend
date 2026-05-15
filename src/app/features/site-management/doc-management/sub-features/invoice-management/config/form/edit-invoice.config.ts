import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_INVOICE_FORM_CONFIG } from './add-invoice.config';
import { IEditInvoiceUIFormDto } from '../../types/invoice.dto';

const EDIT_INVOICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditInvoiceUIFormDto> =
  {
    ...ADD_INVOICE_FORM_CONFIG.fields,
    projectName: {
      ...ADD_INVOICE_FORM_CONFIG.fields.projectName,
      disabledInput: true,
    },
    jmcNumber: {
      ...ADD_INVOICE_FORM_CONFIG.fields.jmcNumber,
      disabledInput: true,
    },
  };

export const EDIT_INVOICE_FORM_CONFIG: IFormConfig<IEditInvoiceUIFormDto> = {
  fields: EDIT_INVOICE_FORM_FIELDS_CONFIG,
};
