import { Validators } from '@angular/forms';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  comment: {
    fieldType: EDataType.TEXT_AREA,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
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

export const APPROVAL_ACTION_EXPENSE_FORM_CONFIG: IFormConfig = {
  fields: APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG,
};
