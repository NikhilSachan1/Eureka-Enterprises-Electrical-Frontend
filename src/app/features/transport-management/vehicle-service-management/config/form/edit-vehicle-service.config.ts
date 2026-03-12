import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IVehicleServiceEditUIFormDto } from '../../types/vehicle-service.dto';
import { ADD_VEHICLE_SERVICE_FORM_CONFIG } from './add-vehicle-service.config';

const EDIT_VEHICLE_SERVICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVehicleServiceEditUIFormDto> =
  {
    ...ADD_VEHICLE_SERVICE_FORM_CONFIG.fields,
    vehicleName: {
      ...ADD_VEHICLE_SERVICE_FORM_CONFIG.fields.vehicleName,
      disabledInput: true,
    },
  };

const EDIT_VEHICLE_SERVICE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Vehicle Service',
    tooltip: 'Edit vehicle service',
  },
};

export const EDIT_VEHICLE_SERVICE_FORM_CONFIG: IFormConfig<IVehicleServiceEditUIFormDto> =
  {
    fields: EDIT_VEHICLE_SERVICE_FORM_FIELDS_CONFIG,
    buttons: EDIT_VEHICLE_SERVICE_FORM_BUTTONS_CONFIG,
  };
