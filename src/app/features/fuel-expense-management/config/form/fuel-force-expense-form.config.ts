import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType } from '../../../../shared/types/form-input.types';
import { FUEL_ADD_EXPENSE_INPUT_FIELDS_CONFIG } from './fuel-add-expense-form.config';

export const FUEL_FORCE_EXPENSE_INPUT_FIELDS_CONFIG: IFormConfig = {
  employeeNames: {
    fieldType: EFieldType.MultiSelect,
    id: 'employeeNames',
    fieldName: 'employeeNames',
    label: 'Employee Names',
    validators: [Validators.required],
    multiSelectConfig: {
      optionsDropdown: [
        { value: 'James Butt', key: 'james_butt' },
        { value: 'Mary Smith', key: 'mary_smith' },
        { value: 'John Doe', key: 'john_doe' },
        { value: 'Sara Lee', key: 'sara_lee' },
        { value: 'Michael Johnson', key: 'michael_johnson' },
        { value: 'Emily Davis', key: 'emily_davis' },
        { value: 'David Wilson', key: 'david_wilson' },
        { value: 'Linda Brown', key: 'linda_brown' }
      ],
    }
  },
  ...FUEL_ADD_EXPENSE_INPUT_FIELDS_CONFIG
}; 