import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../shared/models';
import { EFieldType, EFieldSize, EAutocomplete } from '../../../shared/types';

export const FORGOT_PASSWORD_INPUT_FIELDS_CONFIG: IFormConfig = {
  email: {
    fieldType: EFieldType.Text,
    id: 'email',
    fieldName: 'email',
    label: 'Email Address',
    fieldSize: EFieldSize.Large,
    haveFullWidth: true,
    autocomplete: EAutocomplete.On,
    validators: [Validators.required, Validators.email],
  }
}; 