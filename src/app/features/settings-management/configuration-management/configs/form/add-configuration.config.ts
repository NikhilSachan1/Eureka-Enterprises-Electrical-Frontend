import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EDateSelectionMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IConfigurationAddFormDto } from '../../types/configuration.dto';
import { FinancialYearService } from '@core/services/financial-year.service';

const ADD_CONFIGURATION_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IConfigurationAddFormDto> =
  {
    moduleName: {
      fieldType: EDataType.SELECT,
      id: 'moduleName',
      fieldName: 'moduleName',
      label: 'Module Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PERMISSION,
          dropdownName: CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
        },
      },
      validators: [Validators.required],
    },
    configurationName: {
      fieldType: EDataType.TEXT,
      id: 'configurationName',
      fieldName: 'configurationName',
      label: 'Configuration Name',
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    configurationType: {
      fieldType: EDataType.SELECT,
      id: 'configurationType',
      fieldName: 'configurationType',
      label: 'Configuration Type',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.CONFIGURATION,
          dropdownName:
            CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN,
        },
      },
      validators: [Validators.required],
    },
    description: {
      fieldType: EDataType.TEXT_AREA,
      id: 'description',
      fieldName: 'description',
      label: 'Description',
      validators: [Validators.required],
    },
    configContextKey: {
      fieldType: EDataType.TEXT,
      id: 'configContextKey',
      fieldName: 'configContextKey',
      label: 'Configuration Context Key',
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
    },
    configValue: {
      fieldType: EDataType.TEXT,
      id: 'configValue',
      fieldName: 'configValue',
      label: 'Configuration Value',
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    configEffectiveDate: {
      fieldType: EDataType.DATE,
      id: 'configEffectiveDate',
      fieldName: 'configEffectiveDate',
      label: 'Configuration Effective Date',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
        minDate: new FinancialYearService().getFinancialYearStartDate(),
        maxDate: new FinancialYearService().getFinancialYearEndDate(),
      },
    },
  };

const ADD_CONFIGURATION_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Configuration',
    tooltip: 'Add a new configuration',
  },
};

export const ADD_CONFIGURATION_FORM_CONFIG: IFormConfig<IConfigurationAddFormDto> =
  {
    fields: ADD_CONFIGURATION_FORM_FIELDS_CONFIG,
    buttons: ADD_CONFIGURATION_FORM_BUTTONS_CONFIG,
  };
