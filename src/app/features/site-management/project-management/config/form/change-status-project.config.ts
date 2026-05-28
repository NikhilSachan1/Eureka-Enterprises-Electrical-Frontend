import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IProjectChangeStatusFormDto } from '../../types/project.dto';

/** Statuses where remarks are optional (matches `site_statuses` dropdown values). */
const normalizeProjectStatusKey = (status: unknown): string =>
  typeof status === 'string'
    ? status
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '')
    : '';

const isProjectStatusWithOptionalRemarks = (status: unknown): boolean => {
  const key = normalizeProjectStatusKey(status);
  return key === 'completed' || key === 'workcompleted';
};

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
        filterOptions: {
          exclude: ['ongoing', 'upcoming'],
        },
      },
      validators: [Validators.required],
    },
    remarks: {
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      fieldType: EDataType.TEXT_AREA,
      conditionalValidators: [
        {
          dependsOn: 'projectStatus',
          validators: [Validators.required],
          shouldApply: (projectStatus): boolean =>
            !isProjectStatusWithOptionalRemarks(projectStatus),
        },
      ],
    },
  };

export const CHANGE_STATUS_PROJECT_FORM_CONFIG: IFormConfig<IProjectChangeStatusFormDto> =
  {
    fields: CHANGE_STATUS_PROJECT_FORM_FIELDS_CONFIG,
  };
