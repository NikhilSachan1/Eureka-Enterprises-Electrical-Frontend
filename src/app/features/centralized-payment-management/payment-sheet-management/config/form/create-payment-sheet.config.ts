import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ICreatePaymentSheetUIFormDto } from '../../types/payment-sheet.dto';

const CREATE_PAYMENT_SHEET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ICreatePaymentSheetUIFormDto> =
  {
    title: {
      id: 'title',
      fieldName: 'title',
      label: 'Title',
      fieldType: EDataType.TEXT,
      placeholder: 'June 2026 employee settlement',
    },
  };

export const CREATE_PAYMENT_SHEET_FORM_CONFIG: IFormConfig<ICreatePaymentSheetUIFormDto> =
  {
    fields: CREATE_PAYMENT_SHEET_FORM_FIELDS_CONFIG,
  };
