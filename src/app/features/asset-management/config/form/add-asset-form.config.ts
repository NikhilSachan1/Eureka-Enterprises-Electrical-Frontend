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
        { value: 'TechCal Services', key: 'techcal_services' },
        { value: 'ProCal Labs', key: 'procal_labs' },
        { value: 'MetriCal Inc', key: 'metrical_inc' },
        { value: 'CalTech Solutions', key: 'caltech_solutions' },
        { value: 'ThermalCal Pro', key: 'thermalcal_pro' },
        { value: 'ElectriCal Services', key: 'electrical_services' },
        { value: 'PrecisionCal', key: 'precisioncal' },
        { value: 'InstruCal Labs', key: 'instrucal_labs' },
        { value: 'QualiCal Systems', key: 'qualical_systems' },
        { value: 'Other', key: 'other' }
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