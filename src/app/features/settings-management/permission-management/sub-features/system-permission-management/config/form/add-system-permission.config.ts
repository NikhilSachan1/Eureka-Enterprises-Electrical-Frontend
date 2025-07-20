import { Validators } from '@angular/forms';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
} from '@shared/models';
import { EFieldType, EButtonSeverity } from '@shared/types';
import { MODULES_NAME_DATA } from '@shared/config';

const SYSTEM_PERMISSION_FORM_ADD_FIELDS_CONFIG: IFormInputFieldsConfig = {
  moduleName: {
    fieldType: EFieldType.Select,
    id: 'moduleName',
    fieldName: 'moduleName',
    label: 'Module Name',
    selectConfig: {
      optionsDropdown: MODULES_NAME_DATA,
    },
    validators: [Validators.required],
  },
  action: {
    fieldType: EFieldType.Select,
    id: 'action',
    fieldName: 'action',
    label: 'Actions',
    validators: [Validators.required],
  },
  comment: {
    fieldType: EFieldType.TextArea,
    id: 'comment',
    fieldName: 'comment',
    label: 'Description',
    validators: [Validators.required, Validators.minLength(10)],
  },
};

const SYSTEM_PERMISSION_FORM_ADD_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  submit: {
    label: 'Add Permission',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Add a new permission to the system',
  },
};

export const SYSTEM_PERMISSION_FORM_ADD_CONFIG: IFormConfig = {
  fields: SYSTEM_PERMISSION_FORM_ADD_FIELDS_CONFIG,
  buttons: SYSTEM_PERMISSION_FORM_ADD_BUTTONS_CONFIG,
};
