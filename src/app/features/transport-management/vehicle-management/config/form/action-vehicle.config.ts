import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS, EUserRole, MODULE_NAMES } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ACTION_VEHICLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  vehicleAssignee: {
    fieldType: EDataType.SELECT,
    id: 'vehicleAssignee',
    fieldName: 'vehicleAssignee',
    label: 'Select Assignee',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        filterByRole: [EUserRole.EMPLOYEE],
      },
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          const { actionType } = context;
          return actionType === EButtonActionType.HANDOVER_INITIATE;
        },
        validators: [Validators.required],
      },
    ],
  },
  vehicleImages: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'vehicleImages',
    fieldName: 'vehicleImages',
    label: 'Vehicle Images',
    fileConfig: {
      fileLimit: 10,
      acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.IMAGE,
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          const { actionType } = context;
          return (
            actionType === EButtonActionType.HANDOVER_INITIATE ||
            actionType === EButtonActionType.HANDOVER_ACCEPTED
          );
        },
        validators: [Validators.required],
      },
    ],
  },
  comment: {
    fieldType: EDataType.TEXT_AREA,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
    validators: [Validators.required],
  },
};

export const ACTION_VEHICLE_FORM_CONFIG: IFormConfig = {
  fields: ACTION_VEHICLE_FORM_FIELDS_CONFIG,
};
