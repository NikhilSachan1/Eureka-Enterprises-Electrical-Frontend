import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { TEXT_INPUT_ACCEPT_STRIP } from '@shared/constants';
import {
  IFormInputFieldsConfig,
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormConfig,
} from '@shared/types';
import { IGstPaymentReleaseDocAddUIFormDto } from '../../types/doc.dto';

export const GST_PAYMENT_RELEASE_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IGstPaymentReleaseDocAddUIFormDto> =
  {
    gstReleaseUtr: {
      fieldType: EDataType.TEXT,
      id: 'gstReleaseUtr',
      fieldName: 'gstReleaseUtr',
      label: 'UTR / transaction no.',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
      },
      validators: [],
    },
    gstReleaseDate: {
      fieldType: EDataType.DATE,
      id: 'gstReleaseDate',
      fieldName: 'gstReleaseDate',
      label: 'Payment date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    gstReleaseAmount: {
      fieldType: EDataType.NUMBER,
      id: 'gstReleaseAmount',
      fieldName: 'gstReleaseAmount',
      label: 'GST amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(0.01)],
    },
    gstReleaseAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'gstReleaseAttachments',
      fieldName: 'gstReleaseAttachments',
      label: 'Attachment (optional)',
      fileConfig: {
        fileLimit: 5,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
    },
    gstReleaseRemark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'gstReleaseRemark',
      fieldName: 'gstReleaseRemark',
      label: 'Remark',
    },
  };

export const GST_PAYMENT_RELEASE_DOC_FORM_CONFIG: IFormConfig<IGstPaymentReleaseDocAddUIFormDto> =
  {
    fields: GST_PAYMENT_RELEASE_DOC_FORM_FIELDS_CONFIG,
  };
