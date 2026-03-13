import { EDataType } from '@shared/types';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import type { IInputFieldsConfig } from '@shared/types/form/input-fields-config.interface';

export const SELECTED_EMPLOYEES_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  fieldType: EDataType.MULTI_SELECT,
  id: 'allocatedEmployees',
  fieldName: 'allocatedEmployees',
  label: 'Allocated Employees',
  multiSelectConfig: {
    dynamicDropdown: {
      moduleName: MODULE_NAMES.EMPLOYEE,
      dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
    },
  },
};

export const ALLOCATION_ROW_FIELD_CONFIG = {
  allocatedDate: {
    fieldType: EDataType.DATE,
    id: 'allocatedDate',
    fieldName: 'allocatedDate',
    label: 'Allocated Date',
    dateConfig: { touchUI: false },
    validators: [Validators.required],
  },
} satisfies Record<string, Partial<IInputFieldsConfig>>;

export const DEALLOCATION_ROW_FIELD_CONFIG = {
  deallocatedDate: {
    fieldType: EDataType.DATE,
    id: 'deallocatedDate',
    fieldName: 'deallocatedDate',
    label: 'Deallocated Date',
    dateConfig: { touchUI: false },
    validators: [Validators.required],
  },
  remarks: {
    fieldType: EDataType.TEXT_AREA,
    id: 'remarks',
    fieldName: 'remarks',
    label: 'Remarks (optional)',
    validators: [Validators.required],
  },
} satisfies Record<string, Partial<IInputFieldsConfig>>;
