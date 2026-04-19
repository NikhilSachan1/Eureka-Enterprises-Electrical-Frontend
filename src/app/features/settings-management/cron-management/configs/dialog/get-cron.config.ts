import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { TriggerCronComponent } from '../../components/trigger-cron/trigger-cron.component';

export const CRON_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.GENERATE]: {
    dialogConfig: {
      header: 'Run scheduled job',
      message:
        'Run this job now with the settings below? Only continue if you intend to execute it.',
    },
    dynamicComponent: TriggerCronComponent,
  },
};
