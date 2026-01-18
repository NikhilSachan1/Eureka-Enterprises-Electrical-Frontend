import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { ADD_VEHICLE_FORM_CONFIG } from './add-vehicle.config';
import { IvehicleEditFormDto } from '../../types/vehicle.dto';

const EDIT_VEHICLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IvehicleEditFormDto> =
  {
    ...ADD_VEHICLE_FORM_CONFIG.fields,
    vehicleRegistrationNo: {
      ...ADD_VEHICLE_FORM_CONFIG.fields['vehicleRegistrationNo'],
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

export const EDIT_VEHICLE_FORM_CONFIG: IFormConfig<IvehicleEditFormDto> = {
  fields: EDIT_VEHICLE_FORM_FIELDS_CONFIG,
  buttons: EDIT_VEHICLE_FORM_BUTTONS_CONFIG,
};
