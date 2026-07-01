import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectBookPaymentFormDto } from '../../types/book-payment.dto';
import { Validators } from '@angular/forms';

const REJECT_ACTION_BOOK_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectBookPaymentFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      validators: [Validators.required],
    },
  };

export const REJECT_ACTION_BOOK_PAYMENT_FORM_CONFIG: IFormConfig<IRejectBookPaymentFormDto> =
  {
    fields: REJECT_ACTION_BOOK_PAYMENT_FORM_FIELDS_CONFIG,
  };
