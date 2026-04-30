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
import { IPaymentDocAddUIFormDto } from '../../types/doc.dto';

export const PAYMENT_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IPaymentDocAddUIFormDto> =
  {
    invoiceNumber: {
      fieldType: EDataType.SELECT,
      id: 'invoiceNumber',
      fieldName: 'invoiceNumber',
      label: 'Invoice Number',
      validators: [Validators.required],
    },
    transactionNumber: {
      fieldType: EDataType.TEXT,
      id: 'transactionNumber',
      fieldName: 'transactionNumber',
      label: 'Transaction Number',
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
    paymentAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'paymentAttachments',
      fieldName: 'paymentAttachments',
      label: 'Payment Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    paymentRemark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'paymentRemark',
      fieldName: 'paymentRemark',
      label: 'Payment Hold Reason',
    },
  };

export const PAYMENT_DOC_FORM_CONFIG: IFormConfig<IPaymentDocAddUIFormDto> = {
  fields: PAYMENT_DOC_FORM_FIELDS_CONFIG,
};
