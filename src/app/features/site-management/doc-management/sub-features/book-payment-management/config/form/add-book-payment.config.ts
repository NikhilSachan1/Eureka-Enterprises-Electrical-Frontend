import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddBookPaymentUIFormDto } from '../../types/book-payment.dto';
import {
  BOOK_PAYMENT_FORM_CONTEXT_KEYS,
  isBookPaymentHoldReasonRequired,
} from '../../utils/book-payment-invoice-meta.util';

const ADD_BOOK_PAYMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddBookPaymentUIFormDto> =
  {
    projectName: {
      fieldType: EDataType.SELECT,
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        },
      },
      validators: [Validators.required],
    },
    invoiceNumber: {
      fieldType: EDataType.SELECT,
      id: 'invoiceNumber',
      fieldName: 'invoiceNumber',
      label: 'Invoice Number',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: {
          dependsOnField: 'projectName',
          dependsOnFieldLabel: 'a project',
        },
      },
      validators: [Validators.required],
    },
    bookingDate: {
      fieldType: EDataType.DATE,
      id: 'bookingDate',
      fieldName: 'bookingDate',
      label: 'Booking Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    taxableAmount: {
      fieldType: EDataType.NUMBER,
      id: 'taxableAmount',
      fieldName: 'taxableAmount',
      label: 'Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(0)],
    },
    paymentHoldReason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'paymentHoldReason',
      fieldName: 'paymentHoldReason',
      label: 'Payment Hold Reason',
      conditionalValidators: [
        {
          dependsOn: 'taxableAmount',
          shouldApply: (amount, context) =>
            isBookPaymentHoldReasonRequired(
              amount,
              context?.[BOOK_PAYMENT_FORM_CONTEXT_KEYS.invoiceRemaining]
            ),
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const ADD_BOOK_PAYMENT_FORM_CONFIG: IFormConfig<IAddBookPaymentUIFormDto> =
  {
    fields: ADD_BOOK_PAYMENT_FORM_FIELDS_CONFIG,
  };
