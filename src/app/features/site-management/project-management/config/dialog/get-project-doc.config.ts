import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteProjectDocComponent } from '../../components/project-doc/delete-project-doc/delete-project-doc.component';

export const PROJECT_DOC_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteProjectDocComponent,
  },
};
