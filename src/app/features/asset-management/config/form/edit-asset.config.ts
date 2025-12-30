import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_ASSET_FORM_CONFIG } from './add-asset.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';

const EDIT_ASSET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  ...ADD_ASSET_FORM_CONFIG.fields,
  assetId: {
    ...ADD_ASSET_FORM_CONFIG.fields['assetId'],
    disabledInput: true,
  },
};

const EDIT_ASSET_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Asset',
    tooltip: 'Edit asset',
  },
};

export const EDIT_ASSET_FORM_CONFIG: IFormConfig = {
  fields: EDIT_ASSET_FORM_FIELDS_CONFIG,
  buttons: EDIT_ASSET_FORM_BUTTONS_CONFIG,
};
