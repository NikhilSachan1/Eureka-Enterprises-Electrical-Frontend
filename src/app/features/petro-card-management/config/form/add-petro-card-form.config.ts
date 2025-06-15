import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType } from '../../../../shared/types/form-input.types';

export const ADD_PETRO_CARD_INPUT_FIELDS_CONFIG: IFormConfig = {
  cardName: {
    fieldType: EFieldType.Text,
    id: 'cardName',
    fieldName: 'cardName',
    label: 'Card Name',
    validators: [Validators.required, Validators.maxLength(100)],
  },
  cardNumber: {
    fieldType: EFieldType.Text,
    id: 'cardNumber',
    fieldName: 'cardNumber',
    label: 'Card Number',
    validators: [Validators.required, Validators.maxLength(50)],
  },
  expiryDate: {
    fieldType: EFieldType.Individual_Number,
    id: 'expiryDate',
    fieldName: 'expiryDate',
    label: 'Expiry Date',
    validators: [Validators.required],
    individualNumberConfig: {
      length: 4,
      integerOnly: true,
      separators: [
        {
          position: 2,
          content: '/',
        }
      ]
    }
  },
  holderName: {
    fieldType: EFieldType.Text,
    id: 'holderName',
    fieldName: 'holderName',
    label: 'Card Holder Name',
    validators: [Validators.required, Validators.maxLength(100)],
  },
}; 