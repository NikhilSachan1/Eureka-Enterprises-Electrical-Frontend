import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, EUserRole, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import {
  INonEmployeeAddFormDto,
  INonEmployeeEditFormDto,
} from '../../schemas/non-employee.schema';
import { PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG } from '@features/employee-management/configs/form/add-employee.config';

const { firstName, lastName, email, contactNumber, profilePicture } =
  PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG;

// Same inputs as the employee form. Only name, email, contact number and role are mandatory here.
const NON_EMPLOYEE_BASE_FIELDS = {
  firstName,
  lastName,
  email,
  contactNumber: { ...contactNumber, hint: undefined },
  profilePicture: { ...profilePicture, validators: [] },
};

const ADD_NON_EMPLOYEE_FORM_FIELDS_CONFIG = {
  ...NON_EMPLOYEE_BASE_FIELDS,
  roles: {
    id: 'roles',
    fieldName: 'roles',
    label: 'Roles',
    fieldType: EDataType.MULTI_SELECT,
    hint: 'Decides what this user can access after login.',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.ROLE_LIST,
      },
      // These two mean attendance and leave, which a non employee does not have.
      filterOptions: {
        exclude: [EUserRole.EMPLOYEE, EUserRole.DRIVER],
      },
    },
    validators: [Validators.required],
  },
} as unknown as IFormInputFieldsConfig<INonEmployeeAddFormDto>;

const buttons = (label: string, tooltip: string): IFormButtonConfig => ({
  reset: { ...COMMON_FORM_ACTIONS.RESET },
  submit: { ...COMMON_FORM_ACTIONS.SUBMIT, label, tooltip },
});

export const ADD_NON_EMPLOYEE_FORM_CONFIG: IFormConfig<INonEmployeeAddFormDto> =
  {
    fields: ADD_NON_EMPLOYEE_FORM_FIELDS_CONFIG,
    buttons: buttons('Add Non Employee', 'Add non employee'),
  };

export const EDIT_NON_EMPLOYEE_FORM_CONFIG: IFormConfig<INonEmployeeEditFormDto> =
  {
    fields:
      NON_EMPLOYEE_BASE_FIELDS as unknown as IFormInputFieldsConfig<INonEmployeeEditFormDto>,
    buttons: buttons('Update Non Employee', 'Update non employee details'),
  };
