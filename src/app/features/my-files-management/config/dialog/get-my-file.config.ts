import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { RenameMyFileComponent } from '../../components/rename-my-file/rename-my-file.component';

export const MY_FILES_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Rename',
      message: 'Update the file or folder name.',
    },
    dynamicComponent: RenameMyFileComponent,
  },
};
