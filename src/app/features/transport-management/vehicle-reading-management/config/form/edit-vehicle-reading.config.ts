import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_VEHICLE_READING_FORM_CONFIG } from './add-vehicle-reading.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IVehicleReadingEditUIFormDto } from '../../types/vehicle-reading.dto';

const EDIT_VEHICLE_READING_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVehicleReadingEditUIFormDto> =
  {
    ...ADD_VEHICLE_READING_FORM_CONFIG.fields,
  };

const EDIT_VEHICLE_READING_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Vehicle Reading',
    tooltip: 'Edit Vehicle Reading',
  },
};

export const EDIT_VEHICLE_READING_FORM_CONFIG: IFormConfig<IVehicleReadingEditUIFormDto> =
  {
    fields: EDIT_VEHICLE_READING_FORM_FIELDS_CONFIG,
    buttons: EDIT_VEHICLE_READING_FORM_BUTTONS_CONFIG,
  };
