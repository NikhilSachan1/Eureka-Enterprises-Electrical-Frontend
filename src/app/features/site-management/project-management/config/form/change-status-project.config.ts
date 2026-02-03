import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IProjectChangeStatusFormDto } from '../../types/project.dto';

const CHANGE_STATUS_PROJECT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IProjectChangeStatusFormDto> =
  {
    projectStatus: {
      id: 'projectStatus',
      fieldName: 'projectStatus',
      label: 'Project Status',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_STATUS,
        },
      },
      validators: [Validators.required],
    },
    remarks: {
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      fieldType: EDataType.TEXT_AREA,
      validators: [Validators.required],
    },
  };

export const CHANGE_STATUS_PROJECT_FORM_CONFIG: IFormConfig<IProjectChangeStatusFormDto> =
  {
    fields: CHANGE_STATUS_PROJECT_FORM_FIELDS_CONFIG,
  };
