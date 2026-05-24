import { APP_CONFIG } from '@core/config';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IVerifyTdsEntryUIFormDto } from '../../types/tds.dto';

const VERIFY_TDS_ENTRY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVerifyTdsEntryUIFormDto> =
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

export const VERIFY_TDS_ENTRY_FORM_CONFIG: IFormConfig<IVerifyTdsEntryUIFormDto> =
  {
    fields: VERIFY_TDS_ENTRY_FORM_FIELDS_CONFIG,
  };
