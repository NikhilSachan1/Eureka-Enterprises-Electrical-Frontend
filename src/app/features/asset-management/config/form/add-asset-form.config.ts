import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EDateSelectionMode, EFieldType } from '../../../../shared/types/form-input.types';

export const ADD_ASSET_INPUT_FIELDS_CONFIG: IFormConfig = {
  assetName: {
    fieldType: EFieldType.Text,
    id: 'assetName',
    fieldName: 'assetName',
    label: 'Asset Name',
    validators: [Validators.required, Validators.maxLength(100)],
  },
  assetModel: {
    fieldType: EFieldType.Text,
    id: 'assetModel',
    fieldName: 'assetModel',
    label: 'Asset Model',
    validators: [Validators.required, Validators.maxLength(100)],
  },
  assetSerialNumber: {
    fieldType: EFieldType.Text,
    id: 'assetSerialNumber',
    fieldName: 'assetSerialNumber',
    label: 'Asset Serial Number',
    validators: [Validators.required, Validators.maxLength(50)],
  },
  usage: {
    fieldType: EFieldType.Text,
    id: 'usage',
    fieldName: 'usage',
    label: 'Usage',
    validators: [Validators.required],
  },
  calibrationFrom: {
    fieldType: EFieldType.Select,
    id: 'calibrationFrom',
    fieldName: 'calibrationFrom',
    label: 'Calibration From',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { label: 'TechCal Services', value: 'techcal_services' },
        { label: 'ProCal Labs', value: 'procal_labs' },
        { label: 'MetriCal Inc', value: 'metrical_inc' },
        { label: 'CalTech Solutions', value: 'caltech_solutions' },
        { label: 'ThermalCal Pro', value: 'thermalcal_pro' },
        { label: 'ElectriCal Services', value: 'electrical_services' },
        { label: 'PrecisionCal', value: 'precisioncal' },
        { label: 'InstruCal Labs', value: 'instrucal_labs' },
        { label: 'QualiCal Systems', value: 'qualical_systems' },
        { label: 'Other', value: 'other' }
      ]
    }
  },
  calibrationPeriod: {
    fieldType: EFieldType.Date,
    id: 'calibrationPeriod',
    fieldName: 'calibrationPeriod',
    label: 'Calibration Period',
    validators: [Validators.required],
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    }
  },
  assetCertificate: {
    fieldType: EFieldType.File,
    id: 'assetCertificate',
    fieldName: 'assetCertificate',
    validators: [Validators.required],
    fileConfig: {
      acceptFileTypes: '.pdf,.doc,.docx',
      chooseLabel: 'Upload Asset Certificate',
    }
  },
  assetImages: {
    fieldType: EFieldType.File,
    id: 'assetImages',
    fieldName: 'assetImages',
    fileConfig: {
      acceptFileTypes: 'image/*',
      chooseLabel: 'Upload Asset Images',
      multipleFiles: true,
    }
  }
}; 