import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IVendorEditFormDto } from '../../types/vendor.dto';
import { ADD_VENDOR_FORM_CONFIG } from './add-vendor.config';

const EDIT_VENDOR_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVendorEditFormDto> =
  {
    ...ADD_VENDOR_FORM_CONFIG.fields,
  };

const EDIT_VENDOR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Vendor',
    tooltip: 'Update vendor',
  },
};

export const EDIT_VENDOR_FORM_CONFIG: IFormConfig<IVendorEditFormDto> = {
  fields: EDIT_VENDOR_FORM_FIELDS_CONFIG,
  buttons: EDIT_VENDOR_FORM_BUTTONS_CONFIG,
};
