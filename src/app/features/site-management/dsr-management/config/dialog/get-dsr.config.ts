import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteDsrComponent } from '@features/site-management/dsr-management/components/delete-dsr/delete-dsr.component';
import { AddDsrComponent } from '@features/site-management/dsr-management/components/add-dsr/add-dsr.component';
import { EditDsrComponent } from '@features/site-management/dsr-management/components/edit-dsr/edit-dsr.component';
import { ForceDsrComponent } from '@features/site-management/dsr-management/components/force-dsr/force-dsr.component';

export const DSR_FORCE_ACTION = EButtonActionType.FORCE;

export const DSR_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Add DSR',
      message: 'Add a new daily site progress report.',
    },
    dynamicComponent: AddDsrComponent,
  },

  [EButtonActionType.FORCE]: {
    dialogConfig: {
      header: 'Force DSR',
      message: 'Add a daily site progress report on behalf of an employee.',
    },
    dynamicComponent: ForceDsrComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit DSR',
      message: 'Update daily site progress report details.',
    },
    dynamicComponent: EditDsrComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteDsrComponent,
  },
};
