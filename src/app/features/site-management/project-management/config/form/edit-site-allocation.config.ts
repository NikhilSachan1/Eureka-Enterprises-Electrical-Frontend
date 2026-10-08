import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';

export type ISiteAllocationEditFormDto = {
  role: string | undefined;
  allocateDate: Date | undefined;
  releaseDate: Date | null | undefined;
} & Record<string, unknown>;

const EDIT_SITE_ALLOCATION_FORM_FIELDS: IFormInputFieldsConfig<ISiteAllocationEditFormDto> =
  {
    role: {
      fieldType: EDataType.SELECT,
      id: 'role',
      fieldName: 'role',
      label: 'Role',
      validators: [Validators.required],
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.SITE_ROLES,
        },
      },
    },
    allocateDate: {
      fieldType: EDataType.DATE,
      id: 'allocateDate',
      fieldName: 'allocateDate',
      label: 'Start Date',
      validators: [Validators.required],
      dateConfig: {
        touchUI: false,
      },
    },
    releaseDate: {
      fieldType: EDataType.DATE,
      id: 'releaseDate',
      fieldName: 'releaseDate',
      label: 'End Date',
      dateConfig: {
        touchUI: false,
      },
    },
  };

export const EDIT_SITE_ALLOCATION_FORM_CONFIG: IFormConfig<ISiteAllocationEditFormDto> =
  {
    fields: EDIT_SITE_ALLOCATION_FORM_FIELDS,
  };
