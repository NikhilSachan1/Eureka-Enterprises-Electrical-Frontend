import { APP_CONFIG } from '@core/config';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IVerifyGstEntryUIFormDto } from '../../types/gst.dto';

const VERIFY_GST_ENTRY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVerifyGstEntryUIFormDto> =
  {
    verificationAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'verificationAttachment',
      fieldName: 'verificationAttachment',
      label: 'Attachment',
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

export const VERIFY_GST_ENTRY_FORM_CONFIG: IFormConfig<IVerifyGstEntryUIFormDto> =
  {
    fields: VERIFY_GST_ENTRY_FORM_FIELDS_CONFIG,
  };
