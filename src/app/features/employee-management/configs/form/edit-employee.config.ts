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
import { COMMON_FORM_ACTIONS } from '@shared/config';

const {
  fields: {
    1: personalDetailsFields,
    2: employmentDetailsFields,
    3: educationDetailsFields,
    4: bankDetailsFields,
    5: documentsDetailsFields,
  },
} = ADD_EMPLOYEE_FORM_CONFIG;

const EDIT_PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    ...personalDetailsFields,
  };

const EDIT_EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    ...employmentDetailsFields,
  };

const EDIT_EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    ...educationDetailsFields,
  };

const EDIT_BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  ...bankDetailsFields,
};

const EDIT_DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    ...documentsDetailsFields,
  };

export const EDIT_EMPLOYEE_STEPPER_CONFIG: IStepperConfig = {
  ...ADD_EMPLOYEE_STEPPER_CONFIG,
};

const EDIT_EMPLOYEE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Employee',
    tooltip: 'Edit employee',
  },
};

export const EDIT_EMPLOYEE_FORM_CONFIG: IMultiStepFormConfig = {
  fields: {
    1: EDIT_PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    2: EDIT_EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    3: EDIT_EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    4: EDIT_BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    5: EDIT_DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
  },
  buttons: EDIT_EMPLOYEE_FORM_BUTTONS_CONFIG,
};
