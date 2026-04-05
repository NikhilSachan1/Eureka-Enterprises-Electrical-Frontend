import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { IActionAssetUIFormDto } from '@features/asset-management/types/asset.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ACTION_ASSET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IActionAssetUIFormDto> =
  {
    allocatedToEmployeeName: {
      fieldType: EDataType.SELECT,
      id: 'allocatedToEmployeeName',
      fieldName: 'allocatedToEmployeeName',
      label: 'Select Assignee',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
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
    assetImages: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'assetImages',
      fieldName: 'assetImages',
      label: 'Asset Images',
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
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Remark',
      validators: [Validators.required],
    },
  };

export const ACTION_ASSET_FORM_CONFIG: IFormConfig<IActionAssetUIFormDto> = {
  fields: ACTION_ASSET_FORM_FIELDS_CONFIG,
};
