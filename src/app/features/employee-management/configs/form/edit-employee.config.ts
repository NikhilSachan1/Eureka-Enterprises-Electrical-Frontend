import {
  ADD_EMPLOYEE_FORM_CONFIG,
  ADD_EMPLOYEE_STEPPER_CONFIG,
} from './add-employee.config';
import {
  IFormButtonConfig,
  IFormInputFieldsConfig,
  IMultiStepFormConfig,
  IStepperConfig,
} from '@shared/types';
import {
  COMMON_FORM_ACTIONS,
  STEPPER_UNDO_STEP_BUTTON_CONFIG,
} from '@shared/config';
import { IEmployeeEditFormDto } from '@features/employee-management/types/employee.dto';

const {
  fields: {
    1: personalDetailsFields,
    2: employmentDetailsFields,
    3: educationDetailsFields,
    4: bankDetailsFields,
    5: documentsDetailsFields,
  },
} = ADD_EMPLOYEE_FORM_CONFIG;

const EDIT_PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeEditFormDto>
> = {
  ...personalDetailsFields,
};

const EDIT_EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeEditFormDto>
> = {
  ...employmentDetailsFields,
};

const EDIT_EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeEditFormDto>
> = {
  ...educationDetailsFields,
};

const EDIT_BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeEditFormDto>
> = {
  ...bankDetailsFields,
};

const EDIT_DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeEditFormDto>
> = {
  ...documentsDetailsFields,
};

export const EDIT_EMPLOYEE_STEPPER_CONFIG: IStepperConfig = {
  // Salary (step 6) is not edited here; each step's reset restores the saved details.
  steps: ADD_EMPLOYEE_STEPPER_CONFIG.steps
    .filter(step => step.value !== 6)
    .map(step => ({
      ...step,
      panelConfig: {
        ...step.panelConfig,
        resetButtonConfig: STEPPER_UNDO_STEP_BUTTON_CONFIG,
      },
    })),
  linear: false,
};

const EDIT_EMPLOYEE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.UNDO_ALL_CHANGES,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Employee',
    tooltip: 'Update employee',
  },
};

export const EDIT_EMPLOYEE_FORM_CONFIG: IMultiStepFormConfig<IEmployeeEditFormDto> =
  {
    fields: {
      1: EDIT_PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      2: EDIT_EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      3: EDIT_EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      4: EDIT_BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      5: EDIT_DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    },
    buttons: EDIT_EMPLOYEE_FORM_BUTTONS_CONFIG,
  };
