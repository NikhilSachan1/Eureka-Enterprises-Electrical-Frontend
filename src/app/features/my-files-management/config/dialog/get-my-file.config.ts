import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { CreateMyFileFolderComponent } from '../../components/create-my-file-folder/create-my-file-folder.component';
import { DeleteMyFileComponent } from '../../components/delete-my-file/delete-my-file.component';
import { RenameMyFileComponent } from '../../components/rename-my-file/rename-my-file.component';
import { UploadMyFileComponent } from '../../components/upload-my-file/upload-my-file.component';

export const MY_FILES_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.CREATE_FOLDER]: {
    dialogConfig: {
      header: 'New Folder',
      message: 'Create a new folder in the current location.',
    },
    dynamicComponent: CreateMyFileFolderComponent,
  },

  [EButtonActionType.UPLOAD]: {
    dialogConfig: {
      header: 'Upload Files',
      message: 'Upload files to the current folder.',
    },
    dynamicComponent: UploadMyFileComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Rename',
      message: 'Update the file or folder name.',
    },
    dynamicComponent: RenameMyFileComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteMyFileComponent,
  },
};
