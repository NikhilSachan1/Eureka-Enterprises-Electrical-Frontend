import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { ICONS } from '@shared/constants';
import { IVehicleGetResponseDto } from '../../types/vehicle.dto';
import { isVehicleReturnPending } from '../table/get-vehicle.config';
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
  [EButtonActionType.RETURN_TO_OFFICE]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Return vehicle to office',
      message:
        'Send a return request to the office? The vehicle stays with you until the office accepts it.',
      icon: ICONS.SITE.BUILDING,
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

/** Accept, reject and cancel are shared with handover; these texts are used when the pending request is a return. */
const VEHICLE_RETURN_ACTION_CONFIG_MAP: Partial<
  Record<EButtonActionType, IDialogActionConfig>
> = {
  [EButtonActionType.HANDOVER_ACCEPTED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Accept return',
      message:
        'Confirm the vehicle has been received at the office? It will become available again.',
    },
  },
  [EButtonActionType.HANDOVER_REJECTED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Reject return',
      message:
        'Reject this return request? The vehicle stays with the current holder.',
    },
  },
  [EButtonActionType.HANDOVER_CANCELLED]: {
    dynamicComponent: ActionVehicleComponent,
    dialogConfig: {
      header: 'Cancel return',
      message: 'Cancel this return request? The vehicle will stay with you.',
    },
  },
};

export function getVehicleActionDialogConfig(
  actionType: EButtonActionType,
  row: IVehicleGetResponseDto['records'][number] | undefined
): IDialogActionConfig {
  const returnConfig = VEHICLE_RETURN_ACTION_CONFIG_MAP[actionType];
  if (returnConfig && row && isVehicleReturnPending(row)) {
    return returnConfig;
  }
  return VEHICLE_ACTION_CONFIG_MAP[actionType];
}
