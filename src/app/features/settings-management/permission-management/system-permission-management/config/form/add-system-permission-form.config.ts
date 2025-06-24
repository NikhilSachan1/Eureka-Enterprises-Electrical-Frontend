import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../../../shared/models/input-fields-config.model';
import { EFieldType } from '../../../../../../shared/types/form-input.types';
import { 
  MODULES_DATA, 
} from '../../../../../../shared/config/static-data.config';

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
  label: {
    fieldType: EFieldType.Text,
    id: 'label',
    fieldName: 'label',
    label: 'Label',
    validators: [Validators.required, Validators.minLength(5)],
  },
  description: {
    fieldType: EFieldType.TextArea,
    id: 'description',
    fieldName: 'description',
    label: 'Description',
    validators: [Validators.required, Validators.minLength(10)],
  },
}; 