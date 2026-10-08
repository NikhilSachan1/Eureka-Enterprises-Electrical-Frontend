import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DeleteSiteAllocationComponent } from '../../components/delete-site-allocation/delete-site-allocation.component';
import { EditSiteAllocationComponent } from '../../components/edit-site-allocation/edit-site-allocation.component';

export const SITE_ALLOCATION_HISTORY_ACTION_CONFIG_MAP: Partial<
  Record<EButtonActionType, IDialogActionConfig>
> = {
  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit allocation',
      message:
        'Update the role, start date, or end date. Dates are inclusive. Clear the end date to reopen this allocation. A change that enlarges a date clash is refused.',
    },
    dynamicComponent: EditSiteAllocationComponent,
  },
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteSiteAllocationComponent,
  },
};
