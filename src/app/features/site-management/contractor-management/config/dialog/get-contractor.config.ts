import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteContractorComponent } from '../../components/delete-contractor/delete-contractor.component';
import { ChangeStatusContractorComponent } from '../../components/change-status-contractor/change-status-contractor.component';

export const CONTRACTOR_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> =
  {
    [EButtonActionType.DELETE]: {
      dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
      dynamicComponent: DeleteContractorComponent,
    },
    [EButtonActionType.CHANGE_STATUS]: {
      dialogConfig: {
        header: 'Change contractor status',
        message:
          "Update this contractor's status? Choose the new status below.",
      },
      dynamicComponent: ChangeStatusContractorComponent,
    },
  };
