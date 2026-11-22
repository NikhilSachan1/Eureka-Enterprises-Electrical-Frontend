import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EDialogSize,
  IDialogActionConfig,
} from '@shared/types';
import { CreateMyFileFolderComponent } from '../../components/create-my-file-folder/create-my-file-folder.component';
import { DeleteMyFileComponent } from '../../components/delete-my-file/delete-my-file.component';
import { MoveMyFileComponent } from '../../components/move-my-file/move-my-file.component';
import { RenameMyFileComponent } from '../../components/rename-my-file/rename-my-file.component';
import { UploadMyFileComponent } from '../../components/upload-my-file/upload-my-file.component';

const CANCEL_BUTTON = {
  label: 'Cancel',
  icon: ICONS.ACTIONS.TIMES,
  severity: EButtonSeverity.SECONDARY,
};

/** Every My Files dialog; the page fills in item names for rename / move / delete. */
export const MY_FILES_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.CREATE_FOLDER]: {
    dialogConfig: {
      header: 'New folder',
      message: 'Give the folder a name.',
      icon: ICONS.COMMON.FOLDER,
      size: EDialogSize.SMALL,
      acceptButtonProps: {
        label: 'Create folder',
        id: EButtonActionType.CREATE_FOLDER,
        icon: ICONS.COMMON.PLUS,
        severity: EButtonSeverity.PRIMARY,
      },
      rejectButtonProps: CANCEL_BUTTON,
    },
    dynamicComponent: CreateMyFileFolderComponent,
  },

  [EButtonActionType.UPLOAD]: {
    dialogConfig: {
      header: 'Upload files',
      message: 'Add up to 10 files at a time.',
      icon: ICONS.COMMON.CLOUD_UPLOAD,
      acceptButtonProps: {
        label: 'Upload',
        id: EButtonActionType.UPLOAD,
        icon: ICONS.COMMON.UPLOAD,
        severity: EButtonSeverity.PRIMARY,
      },
      rejectButtonProps: CANCEL_BUTTON,
    },
    dynamicComponent: UploadMyFileComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Rename',
      message: 'Type the new name.',
      icon: ICONS.ACTIONS.PENCIL,
      size: EDialogSize.SMALL,
      acceptButtonProps: {
        label: 'Rename',
        id: EButtonActionType.EDIT,
        icon: ICONS.ACTIONS.CHECK,
        severity: EButtonSeverity.PRIMARY,
      },
      rejectButtonProps: CANCEL_BUTTON,
    },
    dynamicComponent: RenameMyFileComponent,
  },

  [EButtonActionType.MOVE]: {
    dialogConfig: {
      header: 'Move',
      message: 'Open the folder it should go to, then choose Move here.',
      icon: ICONS.COMMON.FOLDER_OPEN,
      acceptButtonProps: {
        label: 'Move here',
        id: EButtonActionType.MOVE,
        icon: ICONS.COMMON.FOLDER_OPEN,
        severity: EButtonSeverity.PRIMARY,
      },
      rejectButtonProps: CANCEL_BUTTON,
    },
    dynamicComponent: MoveMyFileComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: {
      ...DELETE_CONFIRMATION_DIALOG_CONFIG,
      size: EDialogSize.SMALL,
    },
    dynamicComponent: DeleteMyFileComponent,
  },
};
