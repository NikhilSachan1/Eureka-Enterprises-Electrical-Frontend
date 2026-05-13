import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { AddReportComponent } from '../../components/add-report/add-report.component';
import { EditReportComponent } from '../../components/edit-report/edit-report.component';
import { DeleteReportComponent } from '../../components/delete-report/delete-report.component';

export const REPORT_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Add Report',
      message: 'Add a new report to the system.',
    },
    dynamicComponent: AddReportComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Report',
      message: 'Update report details.',
    },
    dynamicComponent: EditReportComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteReportComponent,
  },
};
