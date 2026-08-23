import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_PAYMENT_REQUEST_FORM_CONFIG } from './add-payment-request.config';
import { IEditPaymentRequestUIFormDto } from '../../types/payment-request.dto';

const EDIT_PAYMENT_REQUEST_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditPaymentRequestUIFormDto> =
  {
    ...ADD_PAYMENT_REQUEST_FORM_CONFIG.fields,
    projectName: {
      ...ADD_PAYMENT_REQUEST_FORM_CONFIG.fields.projectName,
      disabledInput: true,
    },
    invoiceNumber: {
      ...ADD_PAYMENT_REQUEST_FORM_CONFIG.fields.invoiceNumber,
      disabledInput: true,
    },
  };

export const EDIT_PAYMENT_REQUEST_FORM_CONFIG: IFormConfig<IEditPaymentRequestUIFormDto> =
  {
    fields: EDIT_PAYMENT_REQUEST_FORM_FIELDS_CONFIG,
  };
