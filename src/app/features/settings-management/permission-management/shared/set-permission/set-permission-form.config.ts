import { IFormButtonConfig, IFormConfig, IFormInputFieldsConfig } from "../../../../../shared/models";
import { EButtonSeverity } from "../../../../../shared/types";

export const SET_PERMISSION_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset permissions',
  },
  submit: {
    label: 'Save Permissions',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Save permissions',
  }
};

export const SET_PERMISSION_FORM_CONFIG: IFormConfig = {
  fields: {} as IFormInputFieldsConfig,
  buttons: SET_PERMISSION_BUTTONS_CONFIG,
}