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
import { IInvoiceDocAddUIFormDto } from '../../types/doc.dto';

export const INVOICE_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IInvoiceDocAddUIFormDto> =
  {
    jmcNumber: {
      fieldType: EDataType.SELECT,
      id: 'jmcNumber',
      fieldName: 'jmcNumber',
      label: 'JMC Number',
      validators: [Validators.required],
    },
    invoiceNumber: {
      fieldType: EDataType.TEXT,
      id: 'invoiceNumber',
      fieldName: 'invoiceNumber',
      label: 'Invoice Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
      },
      validators: [Validators.required],
    },
    invoiceDate: {
      fieldType: EDataType.DATE,
      id: 'invoiceDate',
      fieldName: 'invoiceDate',
      label: 'Invoice Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    invoiceTaxableAmount: {
      fieldType: EDataType.NUMBER,
      id: 'invoiceTaxableAmount',
      fieldName: 'invoiceTaxableAmount',
      label: 'Invoice Taxable Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    invoiceGstAmount: {
      fieldType: EDataType.NUMBER,
      id: 'invoiceGstAmount',
      fieldName: 'invoiceGstAmount',
      label: 'Invoice GST Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    invoiceTotalAmount: {
      fieldType: EDataType.NUMBER,
      id: 'invoiceTotalAmount',
      fieldName: 'invoiceTotalAmount',
      label: 'Invoice Total Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    invoiceAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'invoiceAttachments',
      fieldName: 'invoiceAttachments',
      label: 'Invoice Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    invoiceRemark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'invoiceRemark',
      fieldName: 'invoiceRemark',
      label: 'Invoice Remark',
    },
  };

export const INVOICE_DOC_FORM_CONFIG: IFormConfig<IInvoiceDocAddUIFormDto> = {
  fields: INVOICE_DOC_FORM_FIELDS_CONFIG,
};
