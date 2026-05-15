import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IApproveInvoiceFormDto } from '../../types/invoice.dto';

const APPROVE_ACTION_INVOICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IApproveInvoiceFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const APPROVE_ACTION_INVOICE_FORM_CONFIG: IFormConfig<IApproveInvoiceFormDto> =
  {
    fields: APPROVE_ACTION_INVOICE_FORM_FIELDS_CONFIG,
  };
