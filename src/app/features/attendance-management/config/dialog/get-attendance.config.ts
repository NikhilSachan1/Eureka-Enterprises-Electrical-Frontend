import {
  IConfirmationDialogConfig,
  IConfirmationDialogRecordDetailConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity, ETableActionType } from '@shared/types';
import {
  APPROVE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
  REJECT_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
  REGULARIZE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
} from '../form/dialog-attendance.config';

export const createAttendanceDialogConfig = (
  actionType: ETableActionType,
  recordDetail: IConfirmationDialogRecordDetailConfig,
  isBulk = false,
  showRecords = true,
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => {
  let actionWord = '';
  let acceptLabel = '';
  let inputFields = {} as IFormInputFieldsConfig;

  switch (actionType) {
    case ETableActionType.APPROVE:
      actionWord = 'approve';
      acceptLabel = isBulk ? 'Approve All' : 'Approve';
      inputFields = APPROVE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG;
      break;

    case ETableActionType.REJECT:
      actionWord = 'reject';
      acceptLabel = isBulk ? 'Reject All' : 'Reject';
      inputFields = REJECT_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG;
      break;

    case ETableActionType.REGULARIZE:
      actionWord = 'regularize';
      acceptLabel = 'Regularize';
      inputFields = REGULARIZE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG;
      break;

    default:
      throw new Error(`Unsupported action type: ${actionType}`);
      break;
  }

  const header = `${acceptLabel} Attendance`;
  const message = `Are you sure you want to ${actionWord} ${isBulk ? 'the selected attendance records' : 'this attendance record'}?`;

  const dialogConfig: IConfirmationDialogConfig = {
    dialogSettingConfig: {
      header,
      message,
      acceptButtonProps: {
        label: acceptLabel,
        severity: EButtonSeverity.SUCCESS,
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: EButtonSeverity.SECONDARY,
      },
    },
    recordDetails: showRecords ? recordDetail : undefined,
    inputFields,
    onAccept,
    onReject,
  };
  return dialogConfig;
};
