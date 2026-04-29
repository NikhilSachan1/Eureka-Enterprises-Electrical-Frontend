import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { TEXT_INPUT_ACCEPT_STRIP } from '@shared/constants';
import {
  IFormInputFieldsConfig,
  EDataType,
  ETextCase,
  EInputNumberMode,
  IFormConfig,
} from '@shared/types';
import { IDocPaymentUIFormDto } from '../../types/doc.dto';

export const PAYMENT_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDocPaymentUIFormDto> =
  {
    invoiceId: {
      fieldType: EDataType.SELECT,
      id: 'invoiceId',
      fieldName: 'invoiceId',
      label: 'Invoice ID',
      validators: [Validators.required],
    },
    transactionId: {
      fieldType: EDataType.TEXT,
      id: 'transactionId',
      fieldName: 'transactionId',
      label: 'Transaction ID',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
      },
      validators: [Validators.required],
    },
    paymentDate: {
      fieldType: EDataType.DATE,
      id: 'paymentDate',
      fieldName: 'paymentDate',
      label: 'Payment Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    paymentTaxableAmount: {
      fieldType: EDataType.NUMBER,
      id: 'paymentTaxableAmount',
      fieldName: 'paymentTaxableAmount',
      label: 'Payment Taxable Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    paymentGstAmount: {
      fieldType: EDataType.NUMBER,
      id: 'paymentGstAmount',
      fieldName: 'paymentGstAmount',
      label: 'Payment GST Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    paymentTdsDeductionAmount: {
      fieldType: EDataType.NUMBER,
      id: 'paymentTdsDeductionAmount',
      fieldName: 'paymentTdsDeductionAmount',
      label: 'Payment TDS Deduction Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    paymentTotalAmount: {
      fieldType: EDataType.NUMBER,
      id: 'paymentTotalAmount',
      fieldName: 'paymentTotalAmount',
      label: 'Payment Total Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    transactionReceipt: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'transactionReceipt',
      fieldName: 'transactionReceipt',
      label: 'Transaction Receipt',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    paymentHoldReason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'paymentHoldReason',
      fieldName: 'paymentHoldReason',
      label: 'Payment Hold Reason',
    },
  };

export const PAYMENT_DOC_FORM_CONFIG: IFormConfig<IDocPaymentUIFormDto> = {
  fields: PAYMENT_DOC_FORM_FIELDS_CONFIG,
};
