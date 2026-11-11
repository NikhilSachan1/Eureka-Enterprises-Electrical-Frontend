import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IAddGstPaymentReleaseUIFormDto } from '../../types/gst.dto';

/**
 * Settle held GST. Purchase: we release it to the vendor. Sale: the client pays it to us.
 */
function buildFieldsConfig(
  partyType: EDocContext
): IFormInputFieldsConfig<IAddGstPaymentReleaseUIFormDto> {
  const isPurchase = partyType === EDocContext.PURCHASE;

  return {
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
      label: isPurchase ? 'Released On' : 'Received On',
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
      label: isPurchase ? 'Release proof' : 'Receipt proof',
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
}

export function buildAddGstPaymentReleaseFormConfig(
  partyType: EDocContext
): IFormConfig<IAddGstPaymentReleaseUIFormDto> {
  return { fields: buildFieldsConfig(partyType) };
}
