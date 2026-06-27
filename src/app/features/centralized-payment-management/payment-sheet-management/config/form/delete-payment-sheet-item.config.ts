import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IDeletePaymentSheetItemFormDto } from '../../types/payment-sheet.dto';

const DELETE_PAYMENT_SHEET_ITEM_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDeletePaymentSheetItemFormDto> =
  {
    reason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'reason',
      fieldName: 'reason',
      label: 'Reason',
      placeholder: 'Enter reason for removing this beneficiary',
    },
  };

export const DELETE_PAYMENT_SHEET_ITEM_FORM_CONFIG: IFormConfig<IDeletePaymentSheetItemFormDto> =
  {
    fields: DELETE_PAYMENT_SHEET_ITEM_FORM_FIELDS_CONFIG,
  };
