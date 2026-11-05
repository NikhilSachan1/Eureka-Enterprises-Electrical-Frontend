import { SEARCH_FILTER_EMPLOYEE_FORM_CONFIG } from '@features/employee-management/configs/form/search-filter-employee.config';
import { IEmployeeGetFormDto } from '@features/employee-management/types/employee.dto';
import { CONFIGURATION_KEYS, EUserRole, MODULE_NAMES } from '@shared/constants';
import { ITableSearchFilterFormConfig } from '@shared/types';

const { fields, buttons } = SEARCH_FILTER_EMPLOYEE_FORM_CONFIG;

export const SEARCH_FILTER_NON_EMPLOYEE_FORM_CONFIG: ITableSearchFilterFormConfig<IEmployeeGetFormDto> =
  {
    fields: {
      ...fields,
      employeeRole: {
        ...fields.employeeRole,
        multiSelectConfig: {
          dynamicDropdown: {
            moduleName: MODULE_NAMES.COMMON,
            dropdownName: CONFIGURATION_KEYS.COMMON.ROLE_LIST,
          },
          // Same roles the non employee form leaves out.
          filterOptions: {
            exclude: [EUserRole.EMPLOYEE, EUserRole.DRIVER],
          },
        },
      },
    },
    buttons,
  };
