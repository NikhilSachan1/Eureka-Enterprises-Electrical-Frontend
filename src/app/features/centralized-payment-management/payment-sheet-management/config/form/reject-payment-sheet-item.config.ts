import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectPaymentSheetItemFormDto } from '../../types/payment-sheet.dto';

const REJECT_PAYMENT_SHEET_ITEM_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectPaymentSheetItemFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      placeholder: 'Enter reason for rejecting this beneficiary',
      validators: [Validators.required],
    },
  };

export const REJECT_PAYMENT_SHEET_ITEM_FORM_CONFIG: IFormConfig<IRejectPaymentSheetItemFormDto> =
  {
    fields: REJECT_PAYMENT_SHEET_ITEM_FORM_FIELDS_CONFIG,
  };
