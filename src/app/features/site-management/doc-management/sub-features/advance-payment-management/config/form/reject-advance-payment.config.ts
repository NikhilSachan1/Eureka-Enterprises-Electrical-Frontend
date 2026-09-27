import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectAdvancePaymentFormDto } from '../../types/advance-payment.dto';

const REJECT_ACTION_ADVANCE_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectAdvancePaymentFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Reason',
      validators: [Validators.required],
    },
  };

export const REJECT_ACTION_ADVANCE_PAYMENT_FORM_CONFIG: IFormConfig<IRejectAdvancePaymentFormDto> =
  {
    fields: REJECT_ACTION_ADVANCE_PAYMENT_FORM_FIELDS_CONFIG,
  };
