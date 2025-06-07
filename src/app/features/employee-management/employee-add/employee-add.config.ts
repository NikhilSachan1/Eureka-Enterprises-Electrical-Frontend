import { Validators } from '@angular/forms';
import { ECurrencyDisplay, EFieldSize, EFieldType, EInputNumberMode, IFormConfig } from '../../../shared/models/input-fields-config.model';
import { noSpecialCharactersValidator } from '../../../shared/utility/validators.utils';

export const ADD_EMPLOYEE_INPUT_FIELDS_CONFIG: IFormConfig = {
  fname: {
    fieldType: EFieldType.Text,
    id: 'firstName',
    fieldName: 'fname',
    label: 'First Name',
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(50), noSpecialCharactersValidator()],
  },
  aadharNumber: {
    fieldType: EFieldType.Number,
    id: 'aadharNumber',
    fieldName: 'aadharNumber',
    label: 'Aadhar Number',
    validators: [Validators.required, Validators.minLength(12), Validators.maxLength(12)],
  },
  role: {
    fieldType: EFieldType.Select,
    id: 'role',
    fieldName: 'role',
    label: 'Role',
    selectConfig: {
      optionsDropdown: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
      optionLabel: 'value',
    }
  },
  workOn: {
    fieldType: EFieldType.MultiSelect,
    id: 'workOn',
    fieldName: 'workOn',
    label: 'Work On',
    multiSelectConfig: {
      optionsDropdown: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
      optionLabel: 'value',
    }
  },
  dob: {
    fieldType: EFieldType.Date,
    id: 'dob',
    fieldName: 'dob',
    label: 'Date of Birth',
  },
  password: {
    fieldType: EFieldType.Password,
    id: 'password',
    fieldName: 'password',
    label: 'Password',
    validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20)],
  },
  checkboxInput: {
    fieldType: EFieldType.Checkbox,
    id: 'checkboxInput',
    fieldSize: EFieldSize.Large,
    fieldName: 'checkboxInput',
    label: 'Checkbox',
    checkboxConfig: {
      options: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
    },
    validators: [Validators.required],
  },
  radioInput: {
    fieldType: EFieldType.Radio,
    id: 'radioInput',
    fieldSize: EFieldSize.Large,
    fieldName: 'radioInput',
    label: 'Radio',
    radioConfig: {
      options: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
    },
    validators: [Validators.required],
  },
  fileInput: {
    fieldType: EFieldType.File,
    fieldName: 'fileInput',
    fileConfig: {
      multipleFiles: true,
      acceptFileTypes: 'image/*',
    }
  },
};