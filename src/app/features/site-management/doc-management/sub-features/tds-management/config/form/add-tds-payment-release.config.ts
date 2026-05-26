import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IAddTdsPaymentReleaseUIFormDto } from '../../types/tds.dto';

const ADD_TDS_PAYMENT_RELEASE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddTdsPaymentReleaseUIFormDto> =
  {
    utrNumber: {
      fieldType: EDataType.TEXT,
      id: 'utrNumber',
      fieldName: 'utrNumber',
      label: 'UTR / Reference No.',
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
    paymentAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'paymentAttachment',
      fieldName: 'paymentAttachment',
      label: 'Payment proof',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const ADD_TDS_PAYMENT_RELEASE_FORM_CONFIG: IFormConfig<IAddTdsPaymentReleaseUIFormDto> =
  {
    fields: ADD_TDS_PAYMENT_RELEASE_FORM_FIELDS_CONFIG,
  };
