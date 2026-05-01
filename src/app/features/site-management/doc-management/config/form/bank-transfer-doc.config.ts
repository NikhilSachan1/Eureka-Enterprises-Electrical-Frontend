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
import { IBankTransferDocAddUIFormDto } from '../../types/doc.dto';

export const BANK_TRANSFER_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IBankTransferDocAddUIFormDto> =
  {
    paymentAdviceRef: {
      fieldType: EDataType.SELECT,
      id: 'paymentAdviceRef',
      fieldName: 'paymentAdviceRef',
      label: 'Payment (Draft)',
      validators: [Validators.required],
    },
    utrNumber: {
      fieldType: EDataType.TEXT,
      id: 'utrNumber',
      fieldName: 'utrNumber',
      label: 'UTR / Transaction Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
      },
      validators: [Validators.required],
    },
    transferDate: {
      fieldType: EDataType.DATE,
      id: 'transferDate',
      fieldName: 'transferDate',
      label: 'Transfer Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    transferTotalAmount: {
      fieldType: EDataType.NUMBER,
      id: 'transferTotalAmount',
      fieldName: 'transferTotalAmount',
      label: 'Transfer Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    transferAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'transferAttachments',
      fieldName: 'transferAttachments',
      label: 'Bank Statement / Proof',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    transferRemark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'transferRemark',
      fieldName: 'transferRemark',
      label: 'Remark',
    },
  };

export const BANK_TRANSFER_DOC_FORM_CONFIG: IFormConfig<IBankTransferDocAddUIFormDto> =
  {
    fields: BANK_TRANSFER_DOC_FORM_FIELDS_CONFIG,
  };
