import { Validators } from '@angular/forms';
import {
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IUnsettleAdvanceInvoiceFormDto } from '../../types/invoice.dto';

const UNSETTLE_ADVANCE_INVOICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUnsettleAdvanceInvoiceFormDto> =
  {
    settlementId: {
      fieldType: EDataType.SELECT,
      id: 'settlementId',
      fieldName: 'settlementId',
      label: 'Settlement',
      selectConfig: {
        optionsDropdown: [],
      },
      validators: [Validators.required],
    },
  };

export const UNSETTLE_ADVANCE_INVOICE_FORM_CONFIG: IFormConfig<IUnsettleAdvanceInvoiceFormDto> =
  {
    fields: UNSETTLE_ADVANCE_INVOICE_FORM_FIELDS_CONFIG,
  };
