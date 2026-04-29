import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { TEXT_INPUT_ACCEPT_STRIP } from '@shared/constants';
import {
  IFormInputFieldsConfig,
  EDataType,
  ETextCase,
  IFormConfig,
} from '@shared/types';
import { IDocPaymentAdviceUIFormDto } from '../../types/doc.dto';

export const PAYMENT_ADVICE_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDocPaymentAdviceUIFormDto> =
  {
    paymentId: {
      fieldType: EDataType.SELECT,
      id: 'paymentId',
      fieldName: 'paymentId',
      label: 'Payment ID',
      validators: [Validators.required],
    },
    paymentAdviceNumber: {
      fieldType: EDataType.TEXT,
      id: 'paymentAdviceNumber',
      fieldName: 'paymentAdviceNumber',
      label: 'Payment Advice Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
      },
      validators: [Validators.required],
    },
    paymentAdviceDate: {
      fieldType: EDataType.DATE,
      id: 'paymentAdviceDate',
      fieldName: 'paymentAdviceDate',
      label: 'Payment Advice Date',
      dateConfig: {
        maxDate: new Date(),
      },
      validators: [Validators.required],
    },
    paymentAdviceAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'paymentAdviceAttachments',
      fieldName: 'paymentAdviceAttachments',
      label: 'Payment Advice Attachments',
      fileConfig: {
        fileLimit: 2,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    paymentAdviceRemark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'paymentAdviceRemark',
      fieldName: 'paymentAdviceRemark',
      label: 'Payment Advice Remark',
    },
  };

export const PAYMENT_ADVICE_DOC_FORM_CONFIG: IFormConfig<IDocPaymentAdviceUIFormDto> =
  {
    fields: PAYMENT_ADVICE_DOC_FORM_FIELDS_CONFIG,
  };
