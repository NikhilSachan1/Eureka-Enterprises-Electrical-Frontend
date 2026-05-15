import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectInvoiceFormDto } from '../../types/invoice.dto';
import { Validators } from '@angular/forms';

const REJECT_ACTION_INVOICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectInvoiceFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      validators: [Validators.required],
    },
  };

export const REJECT_ACTION_INVOICE_FORM_CONFIG: IFormConfig<IRejectInvoiceFormDto> =
  {
    fields: REJECT_ACTION_INVOICE_FORM_FIELDS_CONFIG,
  };
