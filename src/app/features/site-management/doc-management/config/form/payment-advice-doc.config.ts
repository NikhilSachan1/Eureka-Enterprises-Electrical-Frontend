import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { TEXT_INPUT_ACCEPT_STRIP } from '@shared/constants';
import {
  IFormInputFieldsConfig,
  EDataType,
  ETextCase,
  IFormConfig,
} from '@shared/types';
import { IPaymentAdviceDocAddFormDto } from '../../types/doc.dto';

export const PAYMENT_ADVICE_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IPaymentAdviceDocAddFormDto> =
  {
    transactionNumber: {
      fieldType: EDataType.SELECT,
      id: 'transactionNumber',
      fieldName: 'transactionNumber',
      label: 'Transaction Number',
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
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { docContext } = context;
            return docContext !== 'purchase';
          },
          validators: [Validators.required],
        },
      ],
    },
    paymentAdviceDate: {
      fieldType: EDataType.DATE,
      id: 'paymentAdviceDate',
      fieldName: 'paymentAdviceDate',
      label: 'Payment Advice Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    paymentAdviceAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'paymentAdviceAttachments',
      fieldName: 'paymentAdviceAttachments',
      label: 'Payment Advice Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { docContext } = context;
            return docContext !== 'purchase';
          },
          validators: [Validators.required],
        },
      ],
    },
    paymentAdviceRemark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'paymentAdviceRemark',
      fieldName: 'paymentAdviceRemark',
      label: 'Payment Advice Remark',
    },
  };

export const PAYMENT_ADVICE_DOC_FORM_CONFIG: IFormConfig<IPaymentAdviceDocAddFormDto> =
  {
    fields: PAYMENT_ADVICE_DOC_FORM_FIELDS_CONFIG,
  };
