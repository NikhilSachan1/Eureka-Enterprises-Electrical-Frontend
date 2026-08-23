import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectPaymentRequestFormDto } from '../../types/payment-request.dto';

const REJECT_ACTION_PAYMENT_REQUEST_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectPaymentRequestFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Reason',
      validators: [Validators.required],
    },
  };

export const REJECT_ACTION_PAYMENT_REQUEST_FORM_CONFIG: IFormConfig<IRejectPaymentRequestFormDto> =
  {
    fields: REJECT_ACTION_PAYMENT_REQUEST_FORM_FIELDS_CONFIG,
  };
