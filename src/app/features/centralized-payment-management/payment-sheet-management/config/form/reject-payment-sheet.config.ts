import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectPaymentSheetFormDto } from '../../types/payment-sheet.dto';

const REJECT_PAYMENT_SHEET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectPaymentSheetFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      placeholder: 'Enter reason for rejecting this payment sheet',
      validators: [Validators.required],
    },
  };

export const REJECT_PAYMENT_SHEET_FORM_CONFIG: IFormConfig<IRejectPaymentSheetFormDto> =
  {
    fields: REJECT_PAYMENT_SHEET_FORM_FIELDS_CONFIG,
  };
