import {
  EDataType,
  EFieldSize,
  IFormConfig,
  IFormInputFieldsConfig,
  IInputFieldsConfig,
} from '@shared/types';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IAllocateDeallocateUIFormDto } from '../../types/project.dto';
import { Validators } from '@angular/forms';

const ALLOCATE_DEALLOCATE_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAllocateDeallocateUIFormDto> =
  {
    employeeNames: {
      id: 'employeeNames',
      fieldName: 'employeeNames',
      label: 'Employee Name',
      fieldType: EDataType.MULTI_SELECT,
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          employeeStatusFilter: ['ACTIVE'],
        },
      },
      validators: [Validators.required],
    },
  };

export const ALLOCATE_DEALLOCATE_EMPLOYEE_FORM_CONFIG: IFormConfig<IAllocateDeallocateUIFormDto> =
  {
    fields: ALLOCATE_DEALLOCATE_EMPLOYEE_FORM_FIELDS_CONFIG,
  };

export const ALLOCATE_DEALLOCATE_ROW_EFFECTIVE_DATE_FIELD_OPTIONS: Partial<IInputFieldsConfig> =
  {
    id: 'allocateDeallocateRowEffectiveDate',
    fieldName: 'date',
    fieldType: EDataType.DATE,
    label: 'Effective date',
    haveFullWidth: true,
    fieldSize: EFieldSize.Small,
    showStandardLabel: false,
    readonlyInput: false,
    dateConfig: {
      touchUI: false,
      showCalendarIcon: true,
    },
  };
