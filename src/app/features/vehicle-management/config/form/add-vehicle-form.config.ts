import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType } from '../../../../shared/types/form-input.types';

export const ADD_VEHICLE_INPUT_FIELDS_CONFIG: IFormConfig = {
  brand: {
    fieldType: EFieldType.Text,
    id: 'brand',
    fieldName: 'brand',
    label: 'Brand',
    validators: [Validators.required, Validators.maxLength(100)],
  },
  model: {
    fieldType: EFieldType.Text,
    id: 'model',
    fieldName: 'model',
    label: 'Model',
    validators: [Validators.required, Validators.maxLength(100)],
  },
  vehicleNumber: {
    fieldType: EFieldType.Text,
    id: 'vehicleNumber',
    fieldName: 'vehicleNumber',
    label: 'Vehicle Number',
    validators: [Validators.required, Validators.maxLength(20)],
  },
  petroCardNumber: {
    fieldType: EFieldType.Text,
    id: 'petroCardNumber',
    fieldName: 'petroCardNumber',
    label: 'Petro Card Number',
    validators: [Validators.required, Validators.maxLength(50)],
  },
  vehicleDocuments: {
    fieldType: EFieldType.File,
    id: 'vehicleDocuments',
    fieldName: 'vehicleDocuments',
    label: 'Vehicle Documents',
    validators: [Validators.required],
    fileConfig: {
      acceptFileTypes: '.pdf,.doc,.docx',
      chooseLabel: 'Upload Vehicle Documents',
      multipleFiles: true,
    }
  },
  vehicleImages: {
    fieldType: EFieldType.File,
    id: 'vehicleImages',
    fieldName: 'vehicleImages',
    label: 'Vehicle Images',
    fileConfig: {
      acceptFileTypes: 'image/*',
      chooseLabel: 'Upload Vehicle Images',
      multipleFiles: true,
    }
  }
}; 