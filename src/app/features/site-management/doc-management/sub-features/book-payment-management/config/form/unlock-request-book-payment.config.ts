import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IUnlockRequestBookPaymentFormDto } from '../../types/book-payment.dto';
import { Validators } from '@angular/forms';

const UNLOCK_REQUEST_ACTION_BOOK_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUnlockRequestBookPaymentFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Reason',
      validators: [Validators.required, Validators.maxLength(50)],
    },
  };

export const UNLOCK_REQUEST_ACTION_BOOK_PAYMENT_FORM_CONFIG: IFormConfig<IUnlockRequestBookPaymentFormDto> =
  {
    fields: UNLOCK_REQUEST_ACTION_BOOK_PAYMENT_FORM_FIELDS_CONFIG,
  };
