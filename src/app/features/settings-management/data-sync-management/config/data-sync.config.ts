import { IDialogActionConfig } from '@shared/types';

/** Page-header button action name for "Sync now". */
export const DATA_SYNC_HEADER_ACTION = 'syncProdToUat';

export const DATA_SYNC_LOADER_CONFIG = {
  title: 'Syncing prod data into UAT',
  message:
    'Copying every table, skipping logs and masking emails / phone numbers. This takes a few seconds.',
};

/** What the sync does, shown on the page before anyone presses the button. */
export const DATA_SYNC_STEPS: readonly string[] = [
  'Every UAT table is replaced with the current prod data.',
  'Log tables and device tokens stay empty (listed below).',
  'All emails and phone numbers are replaced with dummy values (e.g. user0001@eureka-uat.test).',
  'The migrations table is not touched, so UAT keeps its own schema.',
  'All or nothing: if anything fails, UAT is left exactly as it was. Prod is only read.',
  'Everyone, including you, is signed out when it finishes.',
];

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
