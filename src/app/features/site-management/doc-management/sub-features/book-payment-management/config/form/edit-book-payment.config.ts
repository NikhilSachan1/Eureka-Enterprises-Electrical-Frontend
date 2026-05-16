import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_BOOK_PAYMENT_FORM_CONFIG } from './add-book-payment.config';
import { IEditBookPaymentUIFormDto } from '../../types/book-payment.dto';

const EDIT_BOOK_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditBookPaymentUIFormDto> =
  {
    ...ADD_BOOK_PAYMENT_FORM_CONFIG.fields,
    invoiceNumber: {
      ...ADD_BOOK_PAYMENT_FORM_CONFIG.fields.invoiceNumber,
      disabledInput: true,
    },
  };

export const EDIT_BOOK_PAYMENT_FORM_CONFIG: IFormConfig<IEditBookPaymentUIFormDto> =
  {
    fields: EDIT_BOOK_PAYMENT_FORM_FIELDS_CONFIG,
  };
