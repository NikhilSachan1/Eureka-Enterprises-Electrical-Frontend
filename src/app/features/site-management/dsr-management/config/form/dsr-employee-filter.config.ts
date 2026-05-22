import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDataType, IInputFieldsConfig } from '@shared/types';

export const DSR_EMPLOYEE_FILTER_FIELD_CONFIG: IInputFieldsConfig = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  fieldType: EDataType.MULTI_SELECT,
  id: 'employeeName',
  fieldName: 'employeeName',
  label: 'Employee Name',
  placeholder: 'Select employees',
  multiSelectConfig: {
    dynamicDropdown: {
      moduleName: MODULE_NAMES.EMPLOYEE,
      dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
      employeeStatusFilter: ['ACTIVE'],
    },
  },
} as IInputFieldsConfig;
