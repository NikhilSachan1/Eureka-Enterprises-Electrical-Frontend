import { Validators } from '@angular/forms';
import { IMyFilesCreateFolderUIFormDto } from '@features/my-files-management/types/my-files.dto';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';

const CREATE_MY_FILE_FOLDER_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IMyFilesCreateFolderUIFormDto> =
  {
    name: {
      id: 'name',
      fieldName: 'name',
      label: 'Folder Name',
      fieldType: EDataType.TEXT,
      validators: [Validators.required],
    },
  };

export const CREATE_MY_FILE_FOLDER_FORM_CONFIG: IFormConfig<IMyFilesCreateFolderUIFormDto> =
  {
    fields: CREATE_MY_FILE_FOLDER_FORM_FIELDS_CONFIG,
  };
