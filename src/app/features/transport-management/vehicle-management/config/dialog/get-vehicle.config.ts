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
      header: 'Start vehicle handover',
      message:
        'Begin the handover process for this vehicle? Add any notes below.',
    },
  },
  [EButtonActionType.HANDOVER_ACCEPTED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Accept handover',
      message: 'Accept this handover and take responsibility for this vehicle?',
    },
  },
  [EButtonActionType.HANDOVER_REJECTED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Reject handover',
      message: 'Reject this handover request?',
    },
  },
  [EButtonActionType.HANDOVER_CANCELLED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Cancel handover',
      message:
        'Cancel this handover? The vehicle will stay with the current holder.',
    },
  },
  [EButtonActionType.DEALLOCATE]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Deallocate vehicle',
      message: 'Remove this vehicle from the current assignee and free it up?',
    },
  },
  [EButtonActionType.UNDER_MAINTENANCE]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Mark under maintenance',
      message:
        'Set this vehicle to under maintenance? It should not be assigned until cleared.',
    },
  },
  [EButtonActionType.RETIRED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Retire vehicle',
      message:
        'Mark this vehicle as retired? This usually means it is permanently out of service.',
    },
  },
  [EButtonActionType.LINK]: {
    dynamicComponent: LinkPetroCardComponent,
    dialogConfig: {
      header: 'Link petro card',
      message:
        'Link this petro card to the selected vehicle? Confirm the pairing below.',
    },
  },
  [EButtonActionType.UNLINK]: {
    dynamicComponent: LinkPetroCardComponent,
    dialogConfig: {
      header: 'Unlink petro card',
      message: 'Remove the link between this petro card and this vehicle?',
    },
  },
};
