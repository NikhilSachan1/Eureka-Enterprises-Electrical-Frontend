import { DEFAULT_SELECT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDataType, IInputFieldsConfig } from '@shared/types';

export const SITE_ALLOCATION_EMPLOYEE_FILTER_FIELD_CONFIG: IInputFieldsConfig =
  {
    ...DEFAULT_SELECT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    placeholder: 'Select employee',
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      haveFilter: true,
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        archivedHandling: 'enabled',
      },
    },
  } as IInputFieldsConfig;
