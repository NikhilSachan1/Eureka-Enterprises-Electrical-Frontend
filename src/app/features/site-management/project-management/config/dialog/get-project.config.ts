import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteProjectComponent } from '../../components/delete-project/delete-project.component';
import { ChangeStatusProjectComponent } from '../../components/change-status-project/change-status-project.component';

export const PROJECT_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteProjectComponent,
  },
  [EButtonActionType.CHANGE_STATUS]: {
    dialogConfig: {
      header: 'Change Project Status',
      message:
        'Are you sure you want to change project status to this project?',
    },
    dynamicComponent: ChangeStatusProjectComponent,
  },
};
