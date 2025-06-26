import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig, IFormButtonConfig } from '../../../../../../shared/models';
import { EFieldType, EButtonSize, EButtonSeverity } from '../../../../../../shared/types';
import { 
  MODULES_DATA, 
} from '../../../../../../shared/config';

const ADD_SYSTEM_PERMISSION_FIELDS_CONFIG: IFormInputFieldsConfig = {
  moduleName: {
    fieldType: EFieldType.Select,
    id: 'moduleName',
    fieldName: 'moduleName',
    label: 'Module Name',
    selectConfig: {
      optionsDropdown: MODULES_DATA,
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

const ADD_SYSTEM_PERMISSION_BUTTONS_CONFIG: IFormButtonConfig = {
  cancel: {
    label: 'Cancel',
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.SECONDARY,
  },
  submit: {
    label: 'Add Permission',
    type: 'submit',
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  }
};

export const ADD_SYSTEM_PERMISSION_INPUT_FIELDS_CONFIG: IFormConfig = {
  fields: ADD_SYSTEM_PERMISSION_FIELDS_CONFIG,
  buttons: ADD_SYSTEM_PERMISSION_BUTTONS_CONFIG,
}; 