import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IDsrAddUIFormDto } from '@features/site-management/dsr-management/types/dsr.dto';
import { APP_CONFIG } from '@core/config';
import { getDateBeforeXDays } from '@shared/utility';

const ADD_DSR_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDsrAddUIFormDto> = {
  statusDate: {
    fieldType: EDataType.DATE,
    id: 'statusDate',
    fieldName: 'statusDate',
    label: 'Status Date',
    dateConfig: {
      minDate: getDateBeforeXDays(6),
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  workDone: {
    id: 'workDone',
    fieldName: 'workDone',
    label: 'Work Done',
    fieldType: EDataType.MULTI_SELECT,
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.PROJECT,
        dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_WORK_TYPES,
      },
    },
    validators: [Validators.required],
  },
  reportedEngineerName: {
    id: 'reportedEngineerName',
    fieldName: 'reportedEngineerName',
    label: 'Reported Engineer Name',
    fieldType: EDataType.AUTOCOMPLETE,
    autocompleteConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        employeeStatusFilter: ['ACTIVE'],
      },
      optionValue: 'label',
    },
    validators: [Validators.required],
  },
  reportedEngineerContact: {
    id: 'reportedEngineerContact',
    fieldName: 'reportedEngineerContact',
    label: 'Reported Engineer Contact',
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
  dsrAttachments: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'dsrAttachments',
    fieldName: 'dsrAttachments',
    label: 'DSR Attachments',
    fileConfig: {
      fileLimit: 2,
      acceptFileTypes: [
        ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
        ...APP_CONFIG.MEDIA_CONFIG.PDF,
      ],
    },
    validators: [Validators.required],
  },
  note: {
    fieldType: EDataType.TEXT_AREA,
    id: 'note',
    fieldName: 'note',
    label: 'Note',
    validators: [Validators.required],
  },
};

const ADD_DSR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add DSR',
    tooltip: 'Add a new DSR',
  },
};

export const ADD_DSR_FORM_CONFIG: IFormConfig<IDsrAddUIFormDto> = {
  fields: ADD_DSR_FORM_FIELDS_CONFIG,
  buttons: ADD_DSR_FORM_BUTTONS_CONFIG,
};
