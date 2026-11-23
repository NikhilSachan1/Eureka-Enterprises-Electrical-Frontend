import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  IButtonConfig,
  IPageHeaderConfig,
} from '@shared/types';
import { IMyFileItemActionConfig } from '../../types/my-files.interface';

/** Page title, same as before the redesign. */
export const MY_FILES_PAGE_HEADER_CONFIG: Partial<IPageHeaderConfig> = {
  title: 'My Files',
  subtitle: 'Browse and download your public files and folders',
};

/** Toolbar: main action. */
export const MY_FILES_UPLOAD_BUTTON_CONFIG: Partial<IButtonConfig> = {
  id: EButtonActionType.UPLOAD,
  label: 'Upload',
  icon: ICONS.COMMON.CLOUD_UPLOAD,
  severity: EButtonSeverity.PRIMARY,
  permission: [APP_PERMISSION.MY_FILES.ADD],
};

/** Toolbar: second action. */
export const MY_FILES_NEW_FOLDER_BUTTON_CONFIG: Partial<IButtonConfig> = {
  id: EButtonActionType.CREATE_FOLDER,
  label: 'New folder',
  icon: ICONS.COMMON.FOLDER,
  severity: EButtonSeverity.SECONDARY,
  variant: EButtonVariant.OUTLINED,
  permission: [APP_PERMISSION.MY_FILES.ADD],
};

/** Under the items when the folder has more than one page. */
export const MY_FILES_LOAD_MORE_BUTTON_CONFIG: Partial<IButtonConfig> = {
  id: EButtonActionType.VIEW,
  label: 'Load more',
  icon: ICONS.COMMON.CHEVRON_DOWN,
  severity: EButtonSeverity.SECONDARY,
  variant: EButtonVariant.OUTLINED,
};

/** The ⋮ menu on every file and folder, in display order. */
export const MY_FILE_ITEM_ACTIONS: IMyFileItemActionConfig[] = [
  { action: 'open', label: 'Open', icon: ICONS.COMMON.EXTERNAL_LINK },
  {
    action: 'download',
    label: 'Download',
    icon: ICONS.COMMON.DOWNLOAD,
    filesOnly: true,
  },
  {
    action: 'rename',
    label: 'Rename',
    icon: ICONS.ACTIONS.PENCIL,
    permission: [APP_PERMISSION.MY_FILES.EDIT],
    separatorBefore: true,
  },
  {
    action: 'move',
    label: 'Move to…',
    icon: ICONS.COMMON.FOLDER_OPEN,
    permission: [APP_PERMISSION.MY_FILES.MOVE],
  },
  {
    action: 'delete',
    label: 'Delete',
    icon: ICONS.ACTIONS.TRASH,
    permission: [APP_PERMISSION.MY_FILES.DELETE],
    danger: true,
    separatorBefore: true,
  },
];
