import { Validators } from '@angular/forms';
import { noSpecialCharactersValidator } from '../../../shared/utility/validators.utils';
import { IFormConfig } from '../../../shared/models/input-fields-config.model';
import { EFieldSize, EFieldType } from '../../../shared/types/form-input.types';

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
      optionsDropdown: [{label: 'Admin', value: 'admin'}, {label: 'Employee', value: 'employee'}],
      optionLabel: 'value',
    }
  },
  workOn: {
    fieldType: EFieldType.MultiSelect,
    id: 'workOn',
    fieldName: 'workOn',
    label: 'Work On',
    multiSelectConfig: {
      optionsDropdown: [{label: 'Admin', value: 'admin'}, {label: 'Employee', value: 'employee'}],
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
      options: [{label: 'Admin', value: 'admin'}, {label: 'Employee', value: 'employee'}],
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
      options: [{label: 'Admin', value: 'admin'}, {label: 'Employee', value: 'employee'}],
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