import { Validators } from '@angular/forms';
import { EAutocomplete, ECalendarView, EDateIconDisplay, EFieldSize, EFieldType, EFileMode, EFloatLabelVariant, EInputNumberMode, EMultiSelectDisplayType, EUpAndDownButtonLayout, IFormConfig } from '../../../shared/models/input-fields-config.model';
import { noSpecialCharactersValidator } from '../../../shared/utility/validators.utils';

export const ADD_EMPLOYEE_INPUT_FIELDS_CONFIG: IFormConfig = {
  fname: {
    fieldType: EFieldType.Text,
    id: 'firstName',
    autocomplete: EAutocomplete.Off,
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'fname',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'First Name',
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(50), noSpecialCharactersValidator()],
  },
  aadharNumber: {
    fieldType: EFieldType.Number,
    id: 'aadharNumber',
    autocomplete: EAutocomplete.Off,
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'aadharNumber',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Aadhar Number',
    validators: [Validators.required, Validators.minLength(12), Validators.maxLength(12)],
    numberConfig: {
      showUpAndDownButtons: true,
      step: 1,
    }
  },
  role: {
    fieldType: EFieldType.Select,
    id: 'role',
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'role',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Role',
    selectConfig: {
      optionsDropdown: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
      optionLabel: 'value',
      showCheckmark: true,
      haveFilter: true,
      filterBy: 'value',
    }
  },
  workOn: {
    fieldType: EFieldType.MultiSelect,
    id: 'workOn',
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'workOn',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Work On',
    multiSelectConfig: {
      optionsDropdown: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
      optionLabel: 'value',
      haveFilter: true,
      filterBy: 'value',
      loading: false,
      showToggleAll: true,
      selectAll: true,
      display: EMultiSelectDisplayType.Chip,
      showClearButton: true,
    }
  },
  dob: {
    fieldType: EFieldType.Date,
    id: 'dob',
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'dob',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Date of Birth',
    dateConfig: {
      iconDisplay: EDateIconDisplay.Input,
      timeOnly: false,
      showButtonBar: true,
      calendarView: ECalendarView.Date,
      numberOfMonths: 1,
    }
  },
  password: {
    fieldType: EFieldType.Password,
    id: 'password',
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'password',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Password',
    passwordConfig: {
      feedback: true,
      promptLabel: 'Choose a password',
      weakLabel: 'Too simple',
      mediumLabel: 'Average complexity',
      strongLabel: 'Complex password',
      toggleMask: true,
      strongRegex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$',
      mediumRegex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$',
    },
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
      binary: false,
      indeterminate: false,
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
      customUpload: true,
      multipleFiles: true,
      acceptFileTypes: 'image/*',
      maxFileSize: 1000000,
      mode: EFileMode.Advanced,
      automaticUpload: true,
      chooseLabel: 'Choose Images',
      cancelLabel: 'Cancel',
      showUploadButton: true,
      showCancelButton: true,
    }
  },
};
