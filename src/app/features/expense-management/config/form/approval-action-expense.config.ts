import { Validators } from '@angular/forms';
import {
  EButtonActionType,
  EFieldType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  approveReason: {
    fieldType: EFieldType.TextArea,
    id: 'approveReason',
    fieldName: 'comment',
    label: 'Approve Reason',
  },
  rejectReason: {
    fieldType: EFieldType.TextArea,
    id: 'rejectReason',
    fieldName: 'comment',
    label: 'Reject Reason',
    validators: [Validators.required],
  },
};

export const APPROVAL_ACTION_EXPENSE_FORM_CONFIG: IFormConfig = {
  fields: APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG,
};

export const getApprovalActionExpenseFormConfig = (
  dialogActionType: EButtonActionType
): IFormConfig => {
  if (dialogActionType === EButtonActionType.APPROVE) {
    const fields: IFormInputFieldsConfig = {
      approveReason: {
        ...APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG['approveReason'],
      },
    };

    return { fields };
  }

  if (dialogActionType === EButtonActionType.REJECT) {
    const fields: IFormInputFieldsConfig = {
      rejectReason: {
        ...APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG['rejectReason'],
      },
    };

    return { fields };
  }

  return APPROVAL_ACTION_EXPENSE_FORM_CONFIG;
};
