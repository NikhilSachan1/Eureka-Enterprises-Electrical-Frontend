import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { TriggerCronComponent } from '../../components/trigger-cron/trigger-cron.component';

export const CRON_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.GENERATE]: {
    dialogConfig: {
      header: 'Trigger Cron Job',
      message: 'Are you sure you want to trigger this cron job?',
    },
    dynamicComponent: TriggerCronComponent,
  },
};
