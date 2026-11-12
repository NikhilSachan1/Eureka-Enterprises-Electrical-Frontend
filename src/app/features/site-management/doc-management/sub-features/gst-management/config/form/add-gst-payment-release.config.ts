import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IAddGstPaymentReleaseUIFormDto } from '../../types/gst.dto';

/**
 * Settle held GST.
 *  Vendor: books a GST release (book payment). The money goes out from the payment sheet /
 *  bank transfer, so only the booking date and remarks are asked here — UTR and proof are
 *  captured on the bank transfer. The UTR / proof fields are not shown.
 *  Contractor: the client has paid the GST — recorded as a bank transfer, so UTR is required.
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
      validators: isPurchase ? [] : [Validators.required],
    },
    paymentDate: {
      fieldType: EDataType.DATE,
      id: 'paymentDate',
      fieldName: 'paymentDate',
      label: isPurchase ? 'Booking Date' : 'Received On',
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
      label: 'Receipt proof',
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
