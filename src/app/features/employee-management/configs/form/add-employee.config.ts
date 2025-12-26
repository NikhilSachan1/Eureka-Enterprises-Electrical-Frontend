import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  BANK_NAME_DATA,
  BRANCH_DATA,
  DEGREE_DATA,
  DESIGNATION_DATA,
  EMPLOYEE_BLOOD_GROUP_DATA,
  EMPLOYEE_GENDER_DATA,
  EMPLOYMENT_TYPE_DATA,
  INDIA_STATE_DATA,
  PASSING_YEAR_DATA,
} from '@shared/config/static-data.config';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IMultiStepFormConfig,
  IFormInputFieldsConfig,
  IStepperConfig,
} from '@shared/types';

const PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  firstName: {
    id: 'firstName',
    fieldName: 'firstName',
    label: 'First Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.TITLECASE,
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
    },
    validators: [Validators.required],
  },
  email: {
    id: 'email',
    fieldName: 'email',
    label: 'Email Address',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
  },
  contactNumber: {
    id: 'contactNumber',
    fieldName: 'contactNumber',
    label: 'Contact Number',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
  },
  emergencyContactNumber: {
    id: 'emergencyContactNumber',
    fieldName: 'emergencyContactNumber',
    label: 'Emergency Contact Number',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
  },
  gender: {
    id: 'gender',
    fieldName: 'gender',
    label: 'Gender',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: EMPLOYEE_GENDER_DATA,
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
    validators: [Validators.required],
  },
  streetName: {
    id: 'streetName',
    fieldName: 'streetName',
    label: 'Street Name',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.SENTENCECASE,
    },
    validators: [Validators.required],
  },
  landmark: {
    id: 'landmark',
    fieldName: 'landmark',
    label: 'Landmark',
    fieldType: EDataType.TEXT,
    textConfig: {
      textCase: ETextCase.SENTENCECASE,
    },
    validators: [Validators.required],
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
    validators: [Validators.required],
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
    readonlyInput: true,
    disabledInput: true,
    validators: [Validators.required],
  },
  previousExperience: {
    id: 'previousExperience',
    fieldName: 'previousExperience',
    label: 'Previous Experience',
    fieldType: EDataType.TEXT,
    validators: [Validators.maxLength(2)],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        shouldApply: (value: unknown) => value !== 'driver',
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
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
    validators: [],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        shouldApply: (value: unknown) => value !== 'driver',
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
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
    validators: [],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        shouldApply: (value: unknown) => value !== 'driver',
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
  },
  uanNumber: {
    id: 'uanNumber',
    fieldName: 'uanNumber',
    label: 'UAN Number',
    fieldType: EDataType.TEXT,
    validators: [],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        shouldApply: (value: unknown) => value !== 'driver',
        validators: [Validators.required],
      },
    ],
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
    validators: [],
    conditionalValidators: [
      {
        dependsOn: 'designation',
        shouldApply: (value: unknown) => value !== 'driver',
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
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
    validators: [],
    // Note: This will be handled manually in component for cross-step dependency
  },
  branch: {
    id: 'branch',
    fieldName: 'branch',
    label: 'Branch',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: BRANCH_DATA,
    },
    validators: [],
    // Note: This will be handled manually in component for cross-step dependency
  },
  passingYear: {
    id: 'passingYear',
    fieldName: 'passingYear',
    label: 'Passing Year',
    fieldType: EDataType.SELECT,
    selectConfig: {
      optionsDropdown: PASSING_YEAR_DATA,
    },
    validators: [],
    // Note: This will be handled manually in component for cross-step dependency
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
    validators: [],
    // Note: This will be handled manually in component for cross-step dependency
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
    validators: [Validators.required],
  },
  accountNumber: {
    id: 'accountNumber',
    fieldName: 'accountNumber',
    label: 'Account Number',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
  },
  ifscCode: {
    id: 'ifscCode',
    fieldName: 'ifscCode',
    label: 'IFSC Code',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
  },
  accountHolderName: {
    id: 'accountHolderName',
    fieldName: 'accountHolderName',
    label: 'Account Holder Name',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
  },
};

// Step 5: Documents Details Form Config
const DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  aadharNumber: {
    id: 'aadharNumber',
    fieldName: 'aadharNumber',
    label: 'Aadhar Number',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
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
    validators: [Validators.required],
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
    validators: [Validators.required],
  },
  passportNumber: {
    id: 'passportNumber',
    fieldName: 'passportNumber',
    label: 'Passport Number',
    fieldType: EDataType.TEXT,
    validators: [],
    // Note: This will be handled manually in component for cross-step dependency
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
    validators: [],
    // Note: This will be handled manually in component for cross-step dependency
  },
  drivingLicenseNumber: {
    id: 'drivingLicenseNumber',
    fieldName: 'drivingLicenseNumber',
    label: 'Driving License Number',
    fieldType: EDataType.TEXT,
    validators: [Validators.required],
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
    validators: [Validators.required],
  },
};

export const ADD_EMPLOYEE_STEPPER_CONFIG: IStepperConfig = {
  steps: [
    {
      value: 1,
      icon: 'pi pi-id-card',
      label: 'Personal',
      panelConfig: {
        templateKey: 'personalDetailsTemplate',
      },
    },
    {
      value: 2,
      icon: 'pi pi-briefcase',
      label: 'Employment',
      panelConfig: {
        templateKey: 'employmentDetailsTemplate',
      },
    },
    {
      value: 3,
      icon: 'pi pi-book',
      label: 'Academic',
      panelConfig: {
        templateKey: 'educationDetailsTemplate',
      },
    },
    {
      value: 4,
      icon: 'pi pi-credit-card',
      label: 'Bank',
      panelConfig: {
        templateKey: 'bankDetailsTemplate',
      },
    },
    {
      value: 5,
      icon: 'pi pi-file',
      label: 'Documents',
      panelConfig: {
        templateKey: 'documentsDetailsTemplate',
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

export const ADD_EMPLOYEE_FORM_CONFIG: IMultiStepFormConfig = {
  fields: {
    1: PERSONAL_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    2: EMPLOYMENT_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    3: EDUCATION_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    4: BANK_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
    5: DOCUMENTS_DETAILS_EMPLOYEE_FORM_FIELDS_CONFIG,
  },
  buttons: ADD_EMPLOYEE_FORM_BUTTONS_CONFIG,
};
