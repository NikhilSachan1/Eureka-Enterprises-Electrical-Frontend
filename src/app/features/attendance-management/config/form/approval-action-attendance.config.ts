import { Validators } from '@angular/forms';
import { IAttendanceActionUIFormDto } from '@features/attendance-management/types/attendance.dto';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPROVAL_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAttendanceActionUIFormDto> =
  {
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Note',
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { actionType } = context;
            return actionType === EButtonActionType.REJECT;
          },
          validators: [Validators.required],
        },
      ],
    },
  };

export const APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG: IFormConfig<IAttendanceActionUIFormDto> =
  {
    fields: APPROVAL_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG,
  };
