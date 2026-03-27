import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IConfigurationEditUIFormDto } from '../../types/configuration.dto';
import { ADD_CONFIGURATION_FORM_CONFIG } from './add-configuration.config';

const EDIT_CONFIGURATION_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IConfigurationEditUIFormDto> =
  {
    ...ADD_CONFIGURATION_FORM_CONFIG.fields,
  };

const EDIT_CONFIGURATION_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Configuration',
    tooltip: 'Update configuration',
  },
};

export const EDIT_CONFIGURATION_FORM_CONFIG: IFormConfig<IConfigurationEditUIFormDto> =
  {
    fields: EDIT_CONFIGURATION_FORM_FIELDS_CONFIG,
    buttons: EDIT_CONFIGURATION_FORM_BUTTONS_CONFIG,
  };
