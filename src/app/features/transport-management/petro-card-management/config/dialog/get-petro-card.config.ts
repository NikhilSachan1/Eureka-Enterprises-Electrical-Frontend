import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeletePetroCardComponent } from '../../components/delete-petro-card/delete-petro-card.component';
import { LinkPetroCardComponent } from '../../components/link-petro-card/link-petro-card.component';

export const PETRO_CARD_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> =
  {
    [EButtonActionType.DELETE]: {
      dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
      dynamicComponent: DeletePetroCardComponent,
    },
    [EButtonActionType.LINK]: {
      dialogConfig: {
        header: 'Link to vehicle',
        message:
          'Connect this petro card to the selected vehicle? Confirm the details below.',
      },
      dynamicComponent: LinkPetroCardComponent,
    },
    [EButtonActionType.UNLINK]: {
      dialogConfig: {
        header: 'Unlink from vehicle',
        message: 'Remove the link between this petro card and this vehicle?',
      },
      dynamicComponent: LinkPetroCardComponent,
    },
  };
