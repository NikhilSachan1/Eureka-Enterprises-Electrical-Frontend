import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType } from '../../../../shared/types/form-input.types';
import { REGULAR_ADD_EXPENSE_INPUT_FIELDS_CONFIG } from './regular-add-expense-form.config';

export const REGULAR_FORCE_EXPENSE_INPUT_FIELDS_CONFIG: IFormConfig = {
  employeeNames: {
    fieldType: EFieldType.MultiSelect,
    id: 'employeeNames',
    fieldName: 'employeeNames',
    label: 'Employee Names',
    validators: [Validators.required],
    multiSelectConfig: {
      optionsDropdown: [
        { label: 'James Butt', value: 'james_butt' },
        { label: 'Mary Smith', value: 'mary_smith' },
        { label: 'John Doe', value: 'john_doe' },
        { label: 'Sara Lee', value: 'sara_lee' },
        { label: 'Michael Johnson', value: 'michael_johnson' },
        { label: 'Emily Davis', value: 'emily_davis' },
        { label: 'David Wilson', value: 'david_wilson' },
        { label: 'Linda Brown', value: 'linda_brown' }
      ],
    }
  },
  ...REGULAR_ADD_EXPENSE_INPUT_FIELDS_CONFIG
}; 