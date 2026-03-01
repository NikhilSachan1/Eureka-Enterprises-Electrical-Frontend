import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  SEVERITY_STYLES,
} from '@shared/config';
import { DeleteAnnouncementComponent } from '@features/announcement-management/components/delete-announcement/delete-announcement.component';
import { AcknowledgeAnnouncementComponent } from '@features/announcement-management/components/acknowledge-announcement/acknowledge-announcement.component';
import { ICONS } from '@shared/constants';

export const ANNOUNCEMENT_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteAnnouncementComponent,
  },
};
const infoStyle = SEVERITY_STYLES.info;

export const SHOW_ANNOUNCEMENT_DIALOG_ACTION_CONFIG: IDialogActionConfig = {
  dialogConfig: {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Announcement',
    icon: ICONS.COMMON.MEGAPHONE,
    message: '',
    iconContainerClass: `${infoStyle.bg} ${infoStyle.border} ${infoStyle.text}`,
    acceptButtonProps: {
      ...CONFIRMATION_DIALOG_CONFIG.acceptButtonProps,
      label: 'Acknowledge',
    },
    rejectButtonProps: {
      ...CONFIRMATION_DIALOG_CONFIG.rejectButtonProps,
      label: 'Dismiss',
    },
  },
  dynamicComponent: AcknowledgeAnnouncementComponent,
};
