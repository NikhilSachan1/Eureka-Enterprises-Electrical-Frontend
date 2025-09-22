import {
  IConfirmationDialogConfig,
  IConfirmationDialogRecordDetailConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity, ETableActionType } from '@shared/types';
import {
  APPROVE_LEAVE_DIALOG_FORM_FIELDS_CONFIG,
  REJECT_LEAVE_DIALOG_FORM_FIELDS_CONFIG,
  CANCEL_LEAVE_DIALOG_FORM_FIELDS_CONFIG,
} from '../form/dialog-leave.config';

export const createLeaveDialogConfig = (
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
  const leaveDate = (
    recordDetail.details.find(detail => detail.label === 'Leave Date')
      ?.value as string
  ).split(' - ')[0];
  const [day, month, year] = leaveDate.split('/');

  const leaveActualDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );
  const isDateIsEarlier = leaveActualDate <= new Date();

  switch (actionType) {
    case ETableActionType.APPROVE:
      actionWord = 'approve';
      acceptLabel = isBulk ? 'Approve All' : 'Approve';
      inputFields = APPROVE_LEAVE_DIALOG_FORM_FIELDS_CONFIG;
      break;

    case ETableActionType.REJECT:
      actionWord = 'reject';
      acceptLabel = isBulk ? 'Reject All' : 'Reject';
      inputFields = isDateIsEarlier
        ? REJECT_LEAVE_DIALOG_FORM_FIELDS_CONFIG
        : {
            approveReason:
              REJECT_LEAVE_DIALOG_FORM_FIELDS_CONFIG['rejectReason'],
          };
      break;

    case ETableActionType.CANCEL:
      actionWord = 'cancel';
      acceptLabel = 'Cancel';
      inputFields = CANCEL_LEAVE_DIALOG_FORM_FIELDS_CONFIG;
      break;

    default:
      throw new Error(`Unsupported action type: ${actionType}`);
      break;
  }

  const header = `${acceptLabel} Leave`;
  const message = `Are you sure you want to ${actionWord} ${isBulk ? 'the selected leave records' : 'this leave record'}?`;

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
