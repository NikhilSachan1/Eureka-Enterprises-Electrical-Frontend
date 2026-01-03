import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { ADD_VEHICLE_FORM_CONFIG } from './add-vehicle.config';

const EDIT_VEHICLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  ...ADD_VEHICLE_FORM_CONFIG.fields,
  registrationNo: {
    ...ADD_VEHICLE_FORM_CONFIG.fields['registrationNo'],
    disabledInput: true,
  },
};

const EDIT_VEHICLE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Vehicle',
    tooltip: 'Edit vehicle',
  },
};

export const EDIT_VEHICLE_FORM_CONFIG: IFormConfig = {
  fields: EDIT_VEHICLE_FORM_FIELDS_CONFIG,
  buttons: EDIT_VEHICLE_FORM_BUTTONS_CONFIG,
};
