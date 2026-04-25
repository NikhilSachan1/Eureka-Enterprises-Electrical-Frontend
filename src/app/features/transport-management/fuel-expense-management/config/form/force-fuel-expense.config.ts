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
import { FinancialYearService } from '@core/services/financial-year.service';

const financialYearService = new FinancialYearService();

const FORCE_FUEL_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IFuelExpenseForceUIFormDto> =
  {
    ...ADD_FUEL_EXPENSE_FORM_CONFIG.fields,
    employeeName: {
      fieldType: EDataType.SELECT,
      id: 'employeeName',
      fieldName: 'employeeName',
      label: 'Employee Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          employeeStatusFilter: ['ACTIVE'],
        },
      },
      validators: [Validators.required],
    },
    fuelFillDate: {
      ...ADD_FUEL_EXPENSE_FORM_CONFIG.fields.fuelFillDate,
      dateConfig: {
        ...ADD_FUEL_EXPENSE_FORM_CONFIG.fields.fuelFillDate.dateConfig,
        minDate: financialYearService.getFinancialYearStartDate(),
      },
    },
    paymentMode: {
      ...ADD_FUEL_EXPENSE_FORM_CONFIG.fields.paymentMode,
      selectConfig: {
        ...ADD_FUEL_EXPENSE_FORM_CONFIG.fields.paymentMode.selectConfig,
        filterOptions: {
          exclude: ['system'],
        },
      },
    },
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
