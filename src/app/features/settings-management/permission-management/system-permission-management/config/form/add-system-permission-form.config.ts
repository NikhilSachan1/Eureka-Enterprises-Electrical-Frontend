import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../../../shared/models';
import { EFieldType } from '../../../../../../shared/types';
import { 
  MODULES_DATA, 
} from '../../../../../../shared/config';

export const ADD_SYSTEM_PERMISSION_INPUT_FIELDS_CONFIG: IFormConfig = {
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