import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IFuelExpenseForceUIFormDto } from '../../types/fuel-expense.dto';
import { ADD_FUEL_EXPENSE_FORM_CONFIG } from './add-fuel-expense.config';

const FORCE_FUEL_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IFuelExpenseForceUIFormDto> =
  {
    employeeName: {
      fieldType: EDataType.SELECT,
      id: 'employeeName',
      fieldName: 'employeeName',
      label: 'Employee Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        },
      },
      validators: [Validators.required],
    },
    ...ADD_FUEL_EXPENSE_FORM_CONFIG.fields,
  };

const FORCE_FUEL_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Force Fuel Expense',
    tooltip: 'Force fuel expense',
  },
};

export const FORCE_FUEL_EXPENSE_FORM_CONFIG: IFormConfig<IFuelExpenseForceUIFormDto> =
  {
    fields: FORCE_FUEL_EXPENSE_FORM_FIELDS_CONFIG,
    buttons: FORCE_FUEL_EXPENSE_FORM_BUTTONS_CONFIG,
  };
