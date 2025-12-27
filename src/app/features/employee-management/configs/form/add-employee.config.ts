import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  BANK_NAME_DATA,
  BRANCH_DATA,
  DEGREE_DATA,
  DESIGNATION_DATA,
  EMPLOYEE_BLOOD_GROUP_DATA,
  EMPLOYMENT_TYPE_DATA,
  INDIA_STATE_DATA,
  PASSING_YEAR_DATA,
} from '@shared/config/static-data.config';
import { EUserRole, ICONS, REGEX } from '@shared/constants';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IMultiStepFormConfig,
  IFormInputFieldsConfig,
  IStepperConfig,
} from '@shared/types';
import { withCustomMessage } from '@shared/utility';

const PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  firstName: {
    id: 'firstName',
    fieldName: 'firstName',
    label: 'First Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [
      Validators.required,
      withCustomMessage(
        Validators.pattern(REGEX.ALPHABETS_WITH_SINGLE_SPACE),
        'Invalid first name'
      ),
    ],
    applyPatternFilter: true,
  },
  lastName: {
    id: 'lastName',
    fieldName: 'lastName',
    label: 'Last Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [Validators.required, Validators.pattern(REGEX.ALPHABETS_ONLY)],
    applyPatternFilter: true,
  },
  fatherName: {
    id: 'fatherName',
    fieldName: 'fatherName',
    label: 'Father Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [
      Validators.required,
      Validators.pattern(REGEX.ALPHABETS_WITH_SPACES),
    ],
    applyPatternFilter: true,
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
      withCustomMessage(
        Validators.pattern(REGEX.EMAIL),
        'Invalid email address'
      ),
    ],
  },
  contactNumber: {
    id: 'contactNumber',
    fieldName: 'contactNumber',
    label: 'Contact Number',
    fieldType: EDataType.TEXT,
    validators: [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
  },
  emergencyContactNumber: {
    id: 'emergencyContactNumber',
    fieldName: 'emergencyContactNumber',
    label: 'Emergency Contact Number',
    fieldType: EDataType.TEXT,
    validators: [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
  },
  gender: {
    id: 'gender',
    fieldName: 'gender',
    label: 'Gender',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: [],
    },
    validators: [Validators.required],
  },
  dateOfBirth: {
    id: 'dateOfBirth',
    fieldName: 'dateOfBirth',
    label: 'Date of Birth',
    fieldType: EDataType.DATE,
    validators: [Validators.required],
  },
  bloodGroup: {
    id: 'bloodGroup',
    fieldName: 'bloodGroup',
    label: 'Blood Group',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: EMPLOYEE_BLOOD_GROUP_DATA,
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
    },
    validators: [
      Validators.required,
      Validators.pattern(REGEX.ALPHANUMERIC_WITH_SPACES),
    ],
    applyPatternFilter: true,
  },
  streetName: {
    id: 'streetName',
    fieldName: 'streetName',
    label: 'Street Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [
      Validators.required,
      Validators.pattern(REGEX.ALPHANUMERIC_WITH_SPACES),
    ],
    applyPatternFilter: true,
  },
  landmark: {
    id: 'landmark',
    fieldName: 'landmark',
    label: 'Landmark',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [
      Validators.required,
      Validators.pattern(REGEX.ALPHANUMERIC_WITH_SPACES),
    ],
    applyPatternFilter: true,
  },
  state: {
    id: 'state',
    fieldName: 'state',
    label: 'State',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: INDIA_STATE_DATA,
    },
    validators: [Validators.required],
  },
  city: {
    id: 'city',
    fieldName: 'city',
    label: 'City',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: [],
    },
    validators: [Validators.required],
  },
  pinCode: {
    id: 'pinCode',
    fieldName: 'pinCode',
    label: 'Pin Code',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
    },
    validators: [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
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
const EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
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
    defaultValue: '0',
    validators: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(2),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
  },
  dateOfJoining: {
    id: 'dateOfJoining',
    fieldName: 'dateOfJoining',
    label: 'Date of Joining',
    fieldType: EDataType.DATE,
    validators: [Validators.required],
  },
  employmentType: {
    id: 'employmentType',
    fieldName: 'employmentType',
    label: 'Employment Type',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: EMPLOYMENT_TYPE_DATA,
    },
    validators: [Validators.required],
  },
  designation: {
    id: 'designation',
    fieldName: 'designation',
    label: 'Designation',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: DESIGNATION_DATA,
    },
    validators: [Validators.required],
  },
  esicNumber: {
    id: 'esicNumber',
    fieldName: 'esicNumber',
    label: 'ESIC Number',
    fieldType: EDataType.TEXT,
    validators: [
      Validators.minLength(17), // TODO: Update to 10 after backend is updated
      Validators.maxLength(17), // TODO: Update to 10 after backend is updated
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
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
    validators: [
      Validators.minLength(12),
      Validators.maxLength(12),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
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
const EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  degree: {
    id: 'degree',
    fieldName: 'degree',
    label: 'Degree',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: DEGREE_DATA,
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value => value !== EUserRole.DRIVER,
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
      optionsDropdown: BRANCH_DATA,
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value => value !== EUserRole.DRIVER,
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
      optionsDropdown: PASSING_YEAR_DATA,
    },
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value => value !== EUserRole.DRIVER,
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
        shouldApply: value => value !== EUserRole.DRIVER,
        validators: [Validators.required],
      },
    ],
  },
};

// Step 4: Bank Details Form Config
const BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  bankName: {
    id: 'bankName',
    fieldName: 'bankName',
    label: 'Bank Name',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: BANK_NAME_DATA,
    },
  },
  accountNumber: {
    id: 'accountNumber',
    fieldName: 'accountNumber',
    label: 'Account Number',
    fieldType: EDataType.TEXT,
    validators: [
      Validators.minLength(9),
      Validators.maxLength(18),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
  },
  ifscCode: {
    id: 'ifscCode',
    fieldName: 'ifscCode',
    label: 'IFSC Code',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
    },
    validators: [
      Validators.minLength(11),
      Validators.maxLength(11),
      Validators.pattern(REGEX.ALPHANUMERIC),
    ],
    applyPatternFilter: true,
  },
  accountHolderName: {
    id: 'accountHolderName',
    fieldName: 'accountHolderName',
    label: 'Account Holder Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [Validators.pattern(REGEX.ALPHABETS_WITH_SPACES)],
    applyPatternFilter: true,
  },
};

// Step 5: Documents Details Form Config
const DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  aadharNumber: {
    id: 'aadharNumber',
    fieldName: 'aadharNumber',
    label: 'Aadhar Number',
    fieldType: EDataType.TEXT,
    validators: [
      Validators.required,
      Validators.minLength(12),
      Validators.maxLength(12),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
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
  pancardNumber: {
    id: 'pancardNumber',
    fieldName: 'pancardNumber',
    label: 'Pancard Number',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.UPPERCASE,
    },
    validators: [
      Validators.minLength(10),
      Validators.maxLength(10),
      withCustomMessage(
        Validators.pattern(REGEX.PAN),
        'Invalid pancard number'
      ),
    ],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value => value !== EUserRole.DRIVER,
        validators: [Validators.required],
      },
    ],
    applyPatternFilter: true,
  },
  pancardDocument: {
    id: 'pancardDocument',
    fieldName: 'pancardDocument',
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
        shouldApply: value => value !== EUserRole.DRIVER,
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
    },
    validators: [
      Validators.minLength(8),
      Validators.maxLength(8),
      withCustomMessage(
        Validators.pattern(REGEX.PASSPORT),
        'Invalid passport number'
      ),
    ],
    applyPatternFilter: true,
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
    },
    validators: [Validators.minLength(16), Validators.maxLength(16)], // ToDo add DL regex after backend is updated
    conditionalValidators: [
      {
        dependsOn: 'designation',
        dependsOnStep: 2,
        shouldApply: value => value === EUserRole.DRIVER,
        validators: [Validators.required],
      },
    ],
    applyPatternFilter: true,
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
        shouldApply: value => value === EUserRole.DRIVER,
        validators: [Validators.required],
      },
    ],
  },
};

// Step 6: Salary Details Form Config
const SALARY_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  basicSalary: {
    id: 'basicSalary',
    fieldName: 'basicSalary',
    label: 'Basic Salary',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  hra: {
    id: 'hra',
    fieldName: 'hra',
    label: 'HRA',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  foodAllowance: {
    id: 'foodAllowance',
    fieldName: 'foodAllowance',
    label: 'Food Allowance',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  tds: {
    id: 'tds',
    fieldName: 'tds',
    label: 'TDS',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  esicContribution: {
    id: 'esicContribution',
    fieldName: 'esicContribution',
    label: 'ESIC Contribution',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  pfContribution: {
    id: 'pfContribution',
    fieldName: 'pfContribution',
    label: 'PF Contribution',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
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
  linear: false,
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

export const ADD_EMPLOYEE_FORM_CONFIG: IMultiStepFormConfig = {
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
