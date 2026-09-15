import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_ADVANCE_PAYMENT_FORM_CONFIG } from './add-advance-payment.config';
import { IEditAdvancePaymentUIFormDto } from '../../types/advance-payment.dto';

const EDIT_ADVANCE_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditAdvancePaymentUIFormDto> =
  {
    ...ADD_ADVANCE_PAYMENT_FORM_CONFIG.fields,
    projectName: {
      ...ADD_ADVANCE_PAYMENT_FORM_CONFIG.fields.projectName,
      disabledInput: true,
    },
    poNumber: {
      ...ADD_ADVANCE_PAYMENT_FORM_CONFIG.fields.poNumber,
      disabledInput: true,
    },
    advanceAttachment: {
      ...ADD_ADVANCE_PAYMENT_FORM_CONFIG.fields.advanceAttachment,
      validators: [],
    },
  };

export const EDIT_ADVANCE_PAYMENT_FORM_CONFIG: IFormConfig<IEditAdvancePaymentUIFormDto> =
  {
    fields: EDIT_ADVANCE_PAYMENT_FORM_FIELDS_CONFIG,
  };
