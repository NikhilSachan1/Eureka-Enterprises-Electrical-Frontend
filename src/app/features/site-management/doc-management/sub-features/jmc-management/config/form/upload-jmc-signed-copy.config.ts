import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IUploadJmcSignedCopyUIFormDto } from '../../types/jmc.dto';

const UPLOAD_JMC_SIGNED_COPY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUploadJmcSignedCopyUIFormDto> =
  {
    signedCopyAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'signedCopyAttachment',
      fieldName: 'signedCopyAttachment',
      label: 'Signed copy',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
  };

export const UPLOAD_JMC_SIGNED_COPY_FORM_CONFIG: IFormConfig<IUploadJmcSignedCopyUIFormDto> =
  {
    fields: UPLOAD_JMC_SIGNED_COPY_FORM_FIELDS_CONFIG,
  };
