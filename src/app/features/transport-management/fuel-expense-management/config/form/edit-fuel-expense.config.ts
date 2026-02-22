import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IFuelExpenseEditUIFormDto } from '../../types/fuel-expense.dto';
import { ADD_FUEL_EXPENSE_FORM_CONFIG } from './add-fuel-expense.config';

const EDIT_FUEL_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IFuelExpenseEditUIFormDto> =
  {
    ...ADD_FUEL_EXPENSE_FORM_CONFIG.fields,
  };

const EDIT_FUEL_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Fuel Expense',
    tooltip: 'Edit fuel expense',
  },
};

export const EDIT_FUEL_EXPENSE_FORM_CONFIG: IFormConfig<IFuelExpenseEditUIFormDto> =
  {
    fields: EDIT_FUEL_EXPENSE_FORM_FIELDS_CONFIG,
    buttons: EDIT_FUEL_EXPENSE_FORM_BUTTONS_CONFIG,
  };
