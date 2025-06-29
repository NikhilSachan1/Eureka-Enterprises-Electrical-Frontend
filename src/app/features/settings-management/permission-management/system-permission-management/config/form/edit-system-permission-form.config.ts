import { IFormConfig, IFormInputFieldsConfig } from "../../../../../../shared/models";
import { EFieldType } from "../../../../../../shared/types";
import { Validators } from "@angular/forms";
import { IFormButtonConfig } from "../../../../../../shared/models";
import { EButtonSeverity } from "../../../../../../shared/types";
import { MODULES_NAME_DATA } from "../../../../../../shared/config";
import { ADD_SYSTEM_PERMISSION_INPUT_FIELDS_CONFIG } from "./add-system-permission-form.config";

const EDIT_SYSTEM_PERMISSION_FIELDS_CONFIG: IFormInputFieldsConfig = {

  comment: ADD_SYSTEM_PERMISSION_INPUT_FIELDS_CONFIG.fields['comment'],
  
};

const EDIT_SYSTEM_PERMISSION_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  submit: {
    label: 'Update Permission',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Update the permission in the system',
  }
};

export const EDIT_SYSTEM_PERMISSION_INPUT_FIELDS_CONFIG: IFormConfig = {
  fields: EDIT_SYSTEM_PERMISSION_FIELDS_CONFIG,
  buttons: EDIT_SYSTEM_PERMISSION_BUTTONS_CONFIG,
}; 