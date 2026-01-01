import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeletePetroCardComponent } from '../../components/delete-petro-card/delete-petro-card.component';

export const PETRO_CARD_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> =
  {
    [EButtonActionType.DELETE]: {
      dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
      dynamicComponent: DeletePetroCardComponent,
    },
  };
