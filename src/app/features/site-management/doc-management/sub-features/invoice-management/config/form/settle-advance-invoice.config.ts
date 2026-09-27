import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ISettleAdvanceInvoiceFormDto } from '../../types/invoice.dto';

const SETTLE_ADVANCE_INVOICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ISettleAdvanceInvoiceFormDto> =
  {
    advanceNumber: {
      fieldType: EDataType.SELECT,
      id: 'advanceNumber',
      fieldName: 'advanceNumber',
      label: 'Advance Number',
      selectConfig: {
        optionsDropdown: [],
      },
      validators: [Validators.required],
    },
    amount: {
      fieldType: EDataType.NUMBER,
      id: 'amount',
      fieldName: 'amount',
      label: 'Settle amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        minimumBoundaryValue: 0.01,
      },
      validators: [Validators.required, Validators.min(0.01)],
    },
  };

export const SETTLE_ADVANCE_INVOICE_FORM_CONFIG: IFormConfig<ISettleAdvanceInvoiceFormDto> =
  {
    fields: SETTLE_ADVANCE_INVOICE_FORM_FIELDS_CONFIG,
  };
