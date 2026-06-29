import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IReturnPaymentSheetFormDto } from '../../types/payment-sheet.dto';

const RETURN_PAYMENT_SHEET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IReturnPaymentSheetFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      placeholder: 'Enter reason for returning this payment sheet to draft',
      validators: [Validators.required],
    },
  };

export const RETURN_PAYMENT_SHEET_FORM_CONFIG: IFormConfig<IReturnPaymentSheetFormDto> =
  {
    fields: RETURN_PAYMENT_SHEET_FORM_FIELDS_CONFIG,
  };
