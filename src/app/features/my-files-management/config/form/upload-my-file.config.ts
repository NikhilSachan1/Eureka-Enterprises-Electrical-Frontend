import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { IMyFilesUploadUIFormDto } from '@features/my-files-management/types/my-files.dto';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';

const UPLOAD_MY_FILE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IMyFilesUploadUIFormDto> =
  {
    files: {
      id: 'files',
      fieldName: 'files',
      label: 'Files',
      fieldType: EDataType.ATTACHMENTS,
      fileConfig: {
        fileLimit: 10,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
          ...APP_CONFIG.MEDIA_CONFIG.DOCUMENT,
          ...APP_CONFIG.MEDIA_CONFIG.SPREADSHEET,
          ...APP_CONFIG.MEDIA_CONFIG.PRESENTATION,
        ],
      },
      validators: [Validators.required],
    },
  };

export const UPLOAD_MY_FILE_FORM_CONFIG: IFormConfig<IMyFilesUploadUIFormDto> =
  {
    fields: UPLOAD_MY_FILE_FORM_FIELDS_CONFIG,
  };
