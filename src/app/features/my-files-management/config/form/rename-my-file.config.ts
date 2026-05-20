import { Validators } from '@angular/forms';
import { IMyFilesRenameUIFormDto } from '@features/my-files-management/types/my-files.dto';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';

const RENAME_MY_FILE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IMyFilesRenameUIFormDto> =
  {
    name: {
      id: 'name',
      fieldName: 'name',
      label: 'Name',
      fieldType: EDataType.TEXT,
      validators: [Validators.required],
    },
  };

export const RENAME_MY_FILE_FORM_CONFIG: IFormConfig<IMyFilesRenameUIFormDto> =
  {
    fields: RENAME_MY_FILE_FORM_FIELDS_CONFIG,
  };
