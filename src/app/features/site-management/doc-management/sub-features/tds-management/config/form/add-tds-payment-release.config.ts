import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IAddTdsPaymentReleaseUIFormDto } from '../../types/tds.dto';

/**
 * TDS challan (ITNS 281). BSR code + date of deposit + challan serial no. identify the challan.
 */
const ADD_TDS_PAYMENT_RELEASE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddTdsPaymentReleaseUIFormDto> =
  {
    bsrCode: {
      fieldType: EDataType.TEXT,
      id: 'bsrCode',
      fieldName: 'bsrCode',
      label: 'BSR Code',
      placeholder: 'e.g. 0510308',
      validators: [Validators.required, Validators.maxLength(20)],
    },
    challanSerialNumber: {
      fieldType: EDataType.TEXT,
      id: 'challanSerialNumber',
      fieldName: 'challanSerialNumber',
      label: 'Challan Serial No.',
      placeholder: 'e.g. 00123',
      validators: [Validators.required, Validators.maxLength(20)],
    },
    paymentDate: {
      fieldType: EDataType.DATE,
      id: 'paymentDate',
      fieldName: 'paymentDate',
      label: 'Date of Deposit',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    utrNumber: {
      fieldType: EDataType.TEXT,
      id: 'utrNumber',
      fieldName: 'utrNumber',
      label: 'Bank Reference / UTR (optional)',
      validators: [Validators.maxLength(100)],
    },
    paymentAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'paymentAttachment',
      fieldName: 'paymentAttachment',
      label: 'Challan copy',
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
