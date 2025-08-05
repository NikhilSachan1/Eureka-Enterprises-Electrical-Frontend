import { IAttendance } from '../../types/attendance.interface';
import { IConfirmationDialogConfig } from '@shared/models';
import { EButtonSeverity } from '@shared/types';
import { DatePipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import {
  APPROVE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
  REJECT_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
} from '../form/dialog-attendance.config';

const datePipe = new DatePipe('en-IN');

export const ATTENDANCE_DIALOG_APPROVE_CONFIG: IConfirmationDialogConfig = {
  dialogSettingConfig: {
    header: 'Approve Attendance',
    message: 'Are you sure you want to approve this attendance?',
    acceptButtonProps: {
      label: 'Approve',
      severity: EButtonSeverity.SUCCESS,
    },
    rejectButtonProps: {
      label: 'Cancel',
      severity: EButtonSeverity.SECONDARY,
    },
  },
  inputFields: APPROVE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
};

export const ATTENDANCE_DIALOG_BULK_APPROVE_CONFIG: IConfirmationDialogConfig =
  {
    dialogSettingConfig: {
      header: 'Approve Attendances',
      message: 'Are you sure you want to approve the selected attendances?',
      acceptButtonProps: {
        label: 'Approve All',
        severity: EButtonSeverity.SUCCESS,
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: EButtonSeverity.SECONDARY,
      },
    },
    inputFields: APPROVE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
  };

export const ATTENDANCE_DIALOG_REJECT_CONFIG: IConfirmationDialogConfig = {
  dialogSettingConfig: {
    header: 'Reject Attendances',
    message: 'Are you sure you want to reject the selected attendance?',
    acceptButtonProps: {
      label: 'Reject',
      severity: EButtonSeverity.SUCCESS,
    },
    rejectButtonProps: {
      label: 'Cancel',
      severity: EButtonSeverity.SECONDARY,
    },
  },
  inputFields: REJECT_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
};

export const ATTENDANCE_DIALOG_BULK_REJECT_CONFIG: IConfirmationDialogConfig = {
  dialogSettingConfig: {
    header: 'Reject Attendances',
    message: 'Are you sure you want to reject the selected attendances?',
    acceptButtonProps: {
      label: 'Reject All',
      severity: EButtonSeverity.SUCCESS,
    },
    rejectButtonProps: {
      label: 'Cancel',
      severity: EButtonSeverity.SECONDARY,
    },
  },
  inputFields: REJECT_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG,
};

export const createAttendanceApproveDialogConfig = (
  rowData: IAttendance,
  onAccept?: (formData?: Record<string, unknown>) => void,
  onReject?: (formData?: Record<string, unknown>) => void
): IConfirmationDialogConfig => {
  return {
    ...ATTENDANCE_DIALOG_APPROVE_CONFIG,
    recordDetails: {
      details: [
        { label: 'Employee Name', value: rowData.employeeName },
        {
          label: 'Attendance Date',
          value: datePipe.transform(
            rowData.attendanceDate,
            APP_CONFIG.DATE_FORMATS.DEFAULT
          ) as string,
        },
        { label: 'Attendance Status', value: rowData.attendanceStatus },
        {
          label: 'Site Location - Client Name',
          value: `${rowData.siteLocation} - ${rowData.clientName}`,
        },
      ],
    },
    onAccept,
    onReject,
  };
};

export const createAttendanceBulkApproveDialogConfig = (
  selectedRows: IAttendance[],
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => {
  return {
    ...ATTENDANCE_DIALOG_BULK_APPROVE_CONFIG,
    onAccept,
    onReject,
  };
};

export const createAttendanceRejectDialogConfig = (
  rowData: IAttendance,
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => {
  return {
    ...ATTENDANCE_DIALOG_REJECT_CONFIG,
    recordDetails: {
      details: [
        { label: 'Employee Name', value: rowData.employeeName },
        {
          label: 'Attendance Date',
          value: datePipe.transform(
            rowData.attendanceDate,
            APP_CONFIG.DATE_FORMATS.DEFAULT
          ) as string,
        },
        { label: 'Attendance Status', value: rowData.attendanceStatus },
        {
          label: 'Site Location - Client Name',
          value: `${rowData.siteLocation} - ${rowData.clientName}`,
        },
      ],
    },
    onAccept,
    onReject,
  };
};

export const createAttendanceBulkRejectDialogConfig = (
  selectedRows: IAttendance[],
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => {
  return {
    ...ATTENDANCE_DIALOG_BULK_REJECT_CONFIG,
    onAccept,
    onReject,
  };
};
