import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  EDateSelectionMode,
  EInputNumberMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IProjectAddFormDto } from '../../types/project.dto';
import { APP_CONFIG } from '@core/config';

const ADD_PROJECT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IProjectAddFormDto> =
  {
    projectName: {
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    companyName: {
      id: 'companyName',
      fieldName: 'companyName',
      label: 'Company Name',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY,
          dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
        },
      },
      validators: [Validators.required],
    },
    contractorNames: {
      id: 'contractorNames',
      fieldName: 'contractorNames',
      label: 'Contractor Names',
      fieldType: EDataType.MULTI_SELECT,
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.CONTRACTOR,
          dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        },
      },
      validators: [Validators.required],
    },
    siteManagerName: {
      id: 'siteManagerName',
      fieldName: 'siteManagerName',
      label: 'Site Manager Name',
      fieldType: EDataType.AUTOCOMPLETE,
      autocompleteConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        },
        optionValue: 'label',
      },
      validators: [Validators.required],
    },
    siteManagerContact: {
      id: 'managerContact',
      fieldName: 'siteManagerContact',
      label: 'Site Manager Contact',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        allowNumberFormatting: false,
      },
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
      ],
    },
    timeline: {
      id: 'timeline',
      fieldName: 'timeline',
      label: 'Timeline',
      fieldType: EDataType.DATE,
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
      },
      validators: [Validators.required],
    },
    blockNumber: {
      id: 'blockNumber',
      fieldName: 'blockNumber',
      label: 'Block Number',
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
        textCase: ETextCase.TITLECASE,
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
    pincode: {
      id: 'pincode',
      fieldName: 'pincode',
      label: 'Pincode',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        allowNumberFormatting: false,
      },
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ],
    },
    baseDistanceKm: {
      id: 'baseDistanceKm',
      fieldName: 'baseDistanceKm',
      label: 'Base Distance (Km)',
      fieldType: EDataType.NUMBER,
      validators: [Validators.required],
    },
    estimatedBudget: {
      fieldType: EDataType.NUMBER,
      id: 'estimatedBudget',
      fieldName: 'estimatedBudget',
      label: 'Estimated Budget',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    workTypes: {
      id: 'workTypes',
      fieldName: 'workTypes',
      label: 'Work Types',
      fieldType: EDataType.MULTI_SELECT,
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_WORK_TYPES,
        },
      },
      validators: [Validators.required],
    },
    remarks: {
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      fieldType: EDataType.TEXT_AREA,
      validators: [Validators.required],
    },
  };

const ADD_PROJECT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Project',
    tooltip: 'Add a new project',
  },
};

export const ADD_PROJECT_FORM_CONFIG: IFormConfig<IProjectAddFormDto> = {
  fields: ADD_PROJECT_FORM_FIELDS_CONFIG,
  buttons: ADD_PROJECT_FORM_BUTTONS_CONFIG,
};
