import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteVehicleComponent } from '../../components/delete-vehicle/delete-vehicle.component';
import { ActionVehicleComponent } from '../../components/action-vehicle/action-vehicle.component';
import { LinkPetroCardComponent } from '@features/transport-management/petro-card-management/components/link-petro-card/link-petro-card.component';

export const VEHICLE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteVehicleComponent,
  },
  [EButtonActionType.HANDOVER_INITIATE]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Handover Vehicle',
      message: 'Are you sure you want to handover this vehicle?',
    },
  },
  [EButtonActionType.HANDOVER_ACCEPTED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Accept Allocation',
      message: 'Are you sure you want to accept this allocation?',
    },
  },
  [EButtonActionType.HANDOVER_REJECTED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Reject Allocation',
      message: 'Are you sure you want to reject this allocation?',
    },
  },
  [EButtonActionType.HANDOVER_CANCELLED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Cancel Allocation',
      message: 'Are you sure you want to cancel this allocation?',
    },
  },
  [EButtonActionType.DEALLOCATE]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Deallocate Vehicle',
      message: 'Are you sure you want to deallocate this vehicle?',
    },
  },
  [EButtonActionType.UNDER_MAINTENANCE]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Under Maintenance',
      message: 'Are you sure you want to put this vehicle under maintenance?',
    },
  },
  [EButtonActionType.RETIRED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Retired',
      message: 'Are you sure you want to retire this vehicle?',
    },
  },
  [EButtonActionType.LINK]: {
    dynamicComponent: LinkPetroCardComponent,
    dialogConfig: {
      header: 'Link Petro Card',
      message: 'Are you sure you want to link this petro card to this vehicle?',
    },
  },
  [EButtonActionType.UNLINK]: {
    dynamicComponent: LinkPetroCardComponent,
    dialogConfig: {
      header: 'Unlink Petro Card',
      message:
        'Are you sure you want to unlink this petro card from this vehicle?',
    },
  },
};
