import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteVendorComponent } from '../../components/delete-vendor/delete-vendor.component';
import { ChangeStatusVendorComponent } from '../../components/change-status-vendor/change-status-vendor.component';

export const VENDOR_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteVendorComponent,
  },
  [EButtonActionType.CHANGE_STATUS]: {
    dialogConfig: {
      header: 'Change vendor status',
      message: "Update this vendor's status? Choose the new status below.",
    },
    dynamicComponent: ChangeStatusVendorComponent,
  },
};
