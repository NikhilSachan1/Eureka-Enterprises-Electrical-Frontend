import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteCompanyComponent } from '../../components/delete-company/delete-company.component';
import { ChangeStatusCompanyComponent } from '../../components/change-status-company/change-status-company.component';

export const COMPANY_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteCompanyComponent,
  },
  [EButtonActionType.CHANGE_STATUS]: {
    dialogConfig: {
      header: 'Change Company Status',
      message:
        'Are you sure you want to change company status to this company?',
    },
    dynamicComponent: ChangeStatusCompanyComponent,
  },
};
