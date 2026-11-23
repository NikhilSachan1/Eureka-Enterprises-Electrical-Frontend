import {
  EButtonActionType,
  EButtonSeverity,
  IButtonConfig,
  IDialogActionConfig,
} from '@shared/types';
import { IDataSyncStep } from '../types/data-sync.interface';

/** Page-header button action name for "Sync now". */
export const DATA_SYNC_HEADER_ACTION = 'syncProdToUat';

export const DATA_SYNC_LOADER_CONFIG = {
  title: 'Syncing prod data into UAT',
  message:
    'Copying every table, skipping logs and masking emails / phone numbers. This takes a few seconds.',
};

/** What the sync does, shown on the page before anyone presses the button. */
export const DATA_SYNC_STEPS: readonly IDataSyncStep[] = [
  {
    icon: 'pi pi-sync',
    title: 'Full refresh',
    text: 'Every UAT table is replaced with the current prod data.',
  },
  {
    icon: 'pi pi-eye-slash',
    title: 'Contacts masked',
    text: 'Emails keep their name but move to @uat.test, so logins stay the same. Phone numbers become dummy values.',
  },
  {
    icon: 'pi pi-inbox',
    title: 'Logs stay empty',
    text: 'Log tables and device tokens are never copied from prod.',
  },
  {
    icon: 'pi pi-shield',
    title: 'UAT schema kept',
    text: 'Migrations are not touched, and permissions that exist only on UAT are put back.',
  },
  {
    icon: 'pi pi-undo',
    title: 'All or nothing',
    text: 'If anything fails, UAT is left exactly as it was. Prod is only ever read.',
  },
  {
    icon: 'pi pi-sign-out',
    title: 'Fresh sign-in',
    text: 'Every session is replaced, so everyone — you too — signs in again afterwards.',
  },
];

/** Seconds the sync result stays on screen before sending the user to the login page. */
export const DATA_SYNC_REDIRECT_SECONDS = 2;

/** In-page button shown after a successful sync, to go to login without waiting. */
export const DATA_SYNC_SIGN_IN_BUTTON_CONFIG: Partial<IButtonConfig> = {
  id: EButtonActionType.PAGE_HEADER_BUTTON_1,
  label: 'Go to login now',
  icon: 'pi pi-sign-in',
  severity: EButtonSeverity.PRIMARY,
};

/** Example shown under "Contacts masked". */
export const DATA_SYNC_EMAIL_EXAMPLE = {
  before: 'nikhil@gmail.com',
  after: 'nikhil@uat.test',
};

export function buildDataSyncConfirmConfig(
  sourceDatabase: string,
  targetDatabase: string,
  onAccept: () => void
): IDialogActionConfig {
  return {
    dialogConfig: {
      header: 'Sync prod data into UAT?',
      message: `All data in "${targetDatabase}" will be replaced with data from "${sourceDatabase}". Anything created only in UAT will be lost, and you will be signed out.`,
    },
    onAccept,
  };
}
