import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  EFieldSize,
  ETextCase,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddReportUIFormDto } from '../../types/report.dto';

const ADD_REPORT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddReportUIFormDto> =
  {
    projectName: {
      fieldType: EDataType.SELECT,
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        },
      },
      validators: [Validators.required],
    },
    jmcNumber: {
      fieldType: EDataType.SELECT,
      id: 'jmcNumber',
      fieldName: 'jmcNumber',
      label: 'JMC Number',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: {
          dependsOnField: 'projectName',
          dependsOnFieldLabel: 'a project',
        },
      },
      validators: [Validators.required],
    },
    isNoReport: {
      fieldType: EDataType.CHECKBOX,
      id: 'isNoReport',
      fieldName: 'isNoReport',
      fieldSize: EFieldSize.Small,
      showStandardLabel: true,
      defaultValue: false,
      checkboxConfig: {
        binary: true,
        bordered: true,
        options: [{ label: 'No Report', value: 'noReport' }],
      },
    },
    reportNumber: {
      fieldType: EDataType.TEXT,
      id: 'reportNumber',
      fieldName: 'reportNumber',
      label: 'Report Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
      },
      conditionalValidators: [
        {
          dependsOn: 'isNoReport',
          shouldApply: (isNoReport: boolean) => !isNoReport,
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
    reportDate: {
      fieldType: EDataType.DATE,
      id: 'reportDate',
      fieldName: 'reportDate',
      label: 'Report Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    reportAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'reportAttachment',
      fieldName: 'reportAttachment',
      label: 'Report Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      conditionalValidators: [
        {
          dependsOn: 'isNoReport',
          shouldApply: (isNoReport: boolean) => !isNoReport,
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      conditionalValidators: [
        {
          dependsOn: 'isNoReport',
          shouldApply: (isNoReport: boolean) => Boolean(isNoReport),
          validators: [Validators.required],
        },
      ],
    },
  };

export const ADD_REPORT_FORM_CONFIG: IFormConfig<IAddReportUIFormDto> = {
  fields: ADD_REPORT_FORM_FIELDS_CONFIG,
};
