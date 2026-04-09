import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { IEmployeeAddFormDto } from '@features/employee-management/types/employee.dto';
import { EDIT_SALARY_FORM_CONFIG } from '@features/payroll-management/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  CONFIGURATION_KEYS,
  EUserRole,
  FORM_VALIDATION_PATTERNS,
  ICONS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IMultiStepFormConfig,
  IFormInputFieldsConfig,
  IStepperConfig,
} from '@shared/types';
import { toLowerCase } from '@shared/utility';

export const PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeAddFormDto>
> = {
  firstName: {
    id: 'firstName',
    fieldName: 'firstName',
    label: 'First Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHABETS_WITH_SPACES,
    },
    validators: [Validators.required],
  },
  lastName: {
    id: 'lastName',
    fieldName: 'lastName',
    label: 'Last Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHABETS_WITH_SPACES,
    },
    validators: [Validators.required],
  },
  fatherName: {
    id: 'fatherName',
    fieldName: 'fatherName',
    label: 'Father Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHABETS_WITH_SPACES,
    },
    validators: [Validators.required],
  },
  email: {
    id: 'email',
    fieldName: 'email',
    label: 'Email Address',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.LOWERCASE,
    },
    validators: [
      Validators.required,
      Validators.pattern(FORM_VALIDATION_PATTERNS.EMAIL),
    ],
  },
  contactNumber: {
    id: 'contactNumber',
    fieldName: 'contactNumber',
    label: 'Contact Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      minimumInputLength: 10,
      maximumInputLength: 10,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    validators: [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
    ],
  },
  emergencyContactNumber: {
    id: 'emergencyContactNumber',
    fieldName: 'emergencyContactNumber',
    label: 'Emergency Contact Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      minimumInputLength: 10,
      maximumInputLength: 10,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    validators: [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
    ],
  },
  gender: {
    id: 'gender',
    fieldName: 'gender',
    label: 'Gender',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.GENDERS,
      },
    },
    validators: [Validators.required],
  },
  dateOfBirth: {
    id: 'dateOfBirth',
    fieldName: 'dateOfBirth',
    label: 'Date of Birth',
    fieldType: EDataType.DATE,
    dateConfig: {
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  bloodGroup: {
    id: 'bloodGroup',
    fieldName: 'bloodGroup',
    label: 'Blood Group',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.BLOOD_GROUPS,
      },
      haveFilter: false,
    },
    validators: [Validators.required],
  },
  houseNumber: {
    id: 'houseNumber',
    fieldName: 'houseNumber',
    label: 'House Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPACES,
    },
    validators: [Validators.required],
  },
  streetName: {
    id: 'streetName',
    fieldName: 'streetName',
    label: 'Street Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPACES,
    },
    validators: [Validators.required],
  },
  landmark: {
    id: 'landmark',
    fieldName: 'landmark',
    label: 'Landmark',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPACES,
    },
    validators: [Validators.required],
  },
  state: {
    id: 'state',
    fieldName: 'state',
    label: 'State',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.STATES,
      },
    },
    validators: [Validators.required],
  },
  city: {
    id: 'city',
    fieldName: 'city',
    label: 'City',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dependentDropdown: {
        dependsOnField: 'state',
        optionsProviderMethod: 'getCitiesByState',
      },
    },
    validators: [Validators.required],
  },
  pinCode: {
    id: 'pinCode',
    fieldName: 'pinCode',
    label: 'Pin Code',
    fieldType: EDataType.TEXT,
    textConfig: {
      minimumInputLength: 6,
      maximumInputLength: 6,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    validators: [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ],
  },
  profilePicture: {
    id: 'profilePicture',
    fieldName: 'profilePicture',
    label: 'Profile Picture',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.IMAGE,
    },
    validators: [Validators.required],
  },
};

// Step 2: Employment Details Form Config
export const EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeAddFormDto>
> = {
  employeeId: {
    id: 'employeeId',
    fieldName: 'employeeId',
    label: 'Employee ID',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
    },
    disabledInput: true,
    validators: [Validators.required],
  },
  previousExperience: {
    id: 'previousExperience',
    fieldName: 'previousExperience',
    label: 'Previous Experience',
    fieldType: EDataType.TEXT,
    textConfig: {
      maximumInputLength: 2,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    defaultValue: 0,
    validators: [Validators.required, Validators.maxLength(2)],
  },
  dateOfJoining: {
    id: 'dateOfJoining',
    fieldName: 'dateOfJoining',
    label: 'Date of Joining',
    fieldType: EDataType.DATE,
    dateConfig: {
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  employmentType: {
    id: 'employmentType',
    fieldName: 'employmentType',
    label: 'Employment Type',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYMENT_TYPES,
      },
    },
    validators: [Validators.required],
  },
  designation: {
    id: 'designation',
    fieldName: 'designation',
    label: 'Designation',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.DESIGNATIONS,
      },
    },
    validators: [Validators.required],
  },
  esicNumber: {
    id: 'esicNumber',
    fieldName: 'esicNumber',
    label: 'ESIC Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      minimumInputLength: 10,
      maximumInputLength: 10,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    validators: [Validators.minLength(10), Validators.maxLength(10)],
  },
  esicDocument: {
    id: 'esicDocument',
    fieldName: 'esicDocument',
    label: 'ESIC Document',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.PDF,
    },
  },
  uanNumber: {
    id: 'uanNumber',
    fieldName: 'uanNumber',
    label: 'UAN Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      minimumInputLength: 12,
      maximumInputLength: 12,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    validators: [Validators.minLength(12), Validators.maxLength(12)],
  },
  uanDocument: {
    id: 'uanDocument',
    fieldName: 'uanDocument',
    label: 'UAN Document',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.PDF,
    },
  },
};

// Step 3: Education Details Form Config
const EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeAddFormDto>
> = {
  degree: {
    id: 'degree',
    fieldName: 'degree',
    label: 'Degree',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.DEGREES,
      },
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) !== toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
  branch: {
    id: 'branch',
    fieldName: 'branch',
    label: 'Branch',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.BRANCHES,
      },
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) !== toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
  passingYear: {
    id: 'passingYear',
    fieldName: 'passingYear',
    label: 'Passing Year',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS,
      },
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) !== toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
  degreeDocument: {
    id: 'degreeDocument',
    fieldName: 'degreeDocument',
    label: 'Degree Document',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.PDF,
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) !== toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
};

// Step 4: Bank Details Form Config
export const BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeAddFormDto>
> = {
  bankName: {
    id: 'bankName',
    fieldName: 'bankName',
    label: 'Bank Name',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.BANK_NAMES,
      },
    },
  },
  accountNumber: {
    id: 'accountNumber',
    fieldName: 'accountNumber',
    label: 'Account Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      minimumInputLength: 9,
      maximumInputLength: 18,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    validators: [Validators.minLength(9), Validators.maxLength(18)],
  },
  ifscCode: {
    id: 'ifscCode',
    fieldName: 'ifscCode',
    label: 'IFSC Code',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      minimumInputLength: 11,
      maximumInputLength: 11,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
    },
    validators: [Validators.minLength(11), Validators.maxLength(11)],
  },
  accountHolderName: {
    id: 'accountHolderName',
    fieldName: 'accountHolderName',
    label: 'Account Holder Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHABETS_WITH_SPACES,
    },
  },
};

// Step 5: Documents Details Form Config
const DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeAddFormDto>
> = {
  aadharNumber: {
    id: 'aadharNumber',
    fieldName: 'aadharNumber',
    label: 'Aadhar Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      minimumInputLength: 12,
      maximumInputLength: 12,
      regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
    },
    validators: [
      Validators.required,
      Validators.minLength(12),
      Validators.maxLength(12),
    ],
  },
  aadharDocument: {
    id: 'aadharDocument',
    fieldName: 'aadharDocument',
    label: 'Aadhar Document',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.PDF,
    },
    validators: [Validators.required],
  },
  panNumber: {
    id: 'panNumber',
    fieldName: 'panNumber',
    label: 'Pancard Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      minimumInputLength: 10,
      maximumInputLength: 10,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
    },
    validators: [Validators.minLength(10), Validators.maxLength(10)],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) !== toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
  panDocument: {
    id: 'panDocument',
    fieldName: 'panDocument',
    label: 'Pancard Document',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.PDF,
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) !== toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
  passportNumber: {
    id: 'passportNumber',
    fieldName: 'passportNumber',
    label: 'Passport Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      minimumInputLength: 8,
      maximumInputLength: 8,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
    },
    validators: [Validators.minLength(8), Validators.maxLength(8)],
  },
  passportDocument: {
    id: 'passportDocument',
    fieldName: 'passportDocument',
    label: 'Passport Document',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.PDF,
    },
  },
  drivingLicenseNumber: {
    id: 'drivingLicenseNumber',
    fieldName: 'drivingLicenseNumber',
    label: 'Driving License Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      minimumInputLength: 16,
      maximumInputLength: 16,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
    },
    validators: [Validators.minLength(16), Validators.maxLength(16)],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) === toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
  drivingLicenseDocument: {
    id: 'drivingLicenseDocument',
    fieldName: 'drivingLicenseDocument',
    label: 'Driving License Document',
    fieldType: EDataType.ATTACHMENTS,
    fileConfig: {
      fileLimit: 1,
      maxFileSize: 1024 * 1024 * 5,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.PDF,
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value =>
          toLowerCase(value) === toLowerCase(EUserRole.DRIVER),
        validators: [Validators.required],
      },
    ],
  },
};

// Step 6: Salary Details Form Config

const {
  basicSalary,
  hra,
  tds,
  employerEsicContribution,
  employeePfContribution,
  foodAllowance,
} = EDIT_SALARY_FORM_CONFIG.fields;

export const SALARY_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IEmployeeAddFormDto>
> = {
  basicSalary,
  hra,
  tds,
  employerEsicContribution,
  employeePfContribution,
  foodAllowance,
};

export const ADD_EMPLOYEE_STEPPER_CONFIG: IStepperConfig = {
  steps: [
    {
      value: 1,
      icon: ICONS.COMMON.USER,
      label: 'Personal',
      panelConfig: {
        templateKey: 'personalDetailsTemplate',
      },
    },
    {
      value: 2,
      icon: ICONS.COMMON.BRIEFCASE,
      label: 'Employment',
      panelConfig: {
        templateKey: 'employmentDetailsTemplate',
      },
    },
    {
      value: 3,
      icon: ICONS.COMMON.BOOK,
      label: 'Academic',
      panelConfig: {
        templateKey: 'educationDetailsTemplate',
      },
    },
    {
      value: 4,
      icon: ICONS.COMMON.CREDIT_CARD,
      label: 'Bank',
      panelConfig: {
        templateKey: 'bankDetailsTemplate',
      },
    },
    {
      value: 5,
      icon: ICONS.COMMON.FILE,
      label: 'Documents',
      panelConfig: {
        templateKey: 'documentsDetailsTemplate',
      },
    },
    {
      value: 6,
      icon: ICONS.EXPENSE.MONEY,
      label: 'Salary',
      panelConfig: {
        templateKey: 'salaryDetailsTemplate',
      },
    },
  ],
};

const ADD_EMPLOYEE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Employee',
    tooltip: 'Add a new employee',
  },
};

export const ADD_EMPLOYEE_FORM_CONFIG: IMultiStepFormConfig<IEmployeeAddFormDto> =
  {
    fields: {
      1: PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      2: EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      3: EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      4: BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      5: DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
      6: SALARY_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    },
    buttons: ADD_EMPLOYEE_FORM_BUTTONS_CONFIG,
  };
