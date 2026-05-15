import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IUnlockRequestInvoiceFormDto } from '../../types/invoice.dto';
import { Validators } from '@angular/forms';

const UNLOCK_REQUEST_ACTION_INVOICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUnlockRequestInvoiceFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Reason',
      validators: [Validators.required, Validators.maxLength(50)],
    },
  };

export const UNLOCK_REQUEST_ACTION_INVOICE_FORM_CONFIG: IFormConfig<IUnlockRequestInvoiceFormDto> =
  {
    fields: UNLOCK_REQUEST_ACTION_INVOICE_FORM_FIELDS_CONFIG,
  };
