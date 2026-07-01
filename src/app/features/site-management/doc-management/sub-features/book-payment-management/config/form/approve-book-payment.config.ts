import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IApproveBookPaymentFormDto } from '../../types/book-payment.dto';

const APPROVE_ACTION_BOOK_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IApproveBookPaymentFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const APPROVE_ACTION_BOOK_PAYMENT_FORM_CONFIG: IFormConfig<IApproveBookPaymentFormDto> =
  {
    fields: APPROVE_ACTION_BOOK_PAYMENT_FORM_FIELDS_CONFIG,
  };
