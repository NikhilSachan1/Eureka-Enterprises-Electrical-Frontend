import { EButtonActionType, EDialogSize, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteProjectComponent } from '../../components/delete-project/delete-project.component';
import { ChangeStatusProjectComponent } from '../../components/change-status-project/change-status-project.component';
import { AssignProjectStakeholdersComponent } from '../../components/assign-project-stakeholders/assign-project-stakeholders.component';

export const PROJECT_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteProjectComponent,
  },
  [EButtonActionType.CHANGE_STATUS]: {
    dialogConfig: {
      header: 'Change project status',
      message: "Update this project's status? Choose the new status below.",
    },
    dynamicComponent: ChangeStatusProjectComponent,
  },
  [EButtonActionType.ASSIGN_VENDOR]: {
    dialogConfig: {
      header: 'Assign vendor',
      message:
        'Choose vendors for this project. Existing vendor assignments can be updated below.',
      size: EDialogSize.LARGE,
      acceptButtonProps: {
        label: 'Assign',
      },
    },
    dynamicComponent: AssignProjectStakeholdersComponent,
  },
};
