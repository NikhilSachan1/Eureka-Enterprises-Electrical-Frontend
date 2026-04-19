import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IProjectEditFormDto } from '../../types/project.dto';
import { ADD_PROJECT_FORM_CONFIG } from './add-project.config';

const EDIT_PROJECT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IProjectEditFormDto> =
  {
    ...ADD_PROJECT_FORM_CONFIG.fields,
  };

const EDIT_PROJECT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Project',
    tooltip: 'Update project',
  },
};

export const EDIT_PROJECT_FORM_CONFIG: IFormConfig<IProjectEditFormDto> = {
  fields: EDIT_PROJECT_FORM_FIELDS_CONFIG,
  buttons: EDIT_PROJECT_FORM_BUTTONS_CONFIG,
};
