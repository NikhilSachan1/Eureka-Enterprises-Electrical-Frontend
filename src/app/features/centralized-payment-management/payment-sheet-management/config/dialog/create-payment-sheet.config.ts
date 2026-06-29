import { CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { ICONS } from '@shared/constants';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { CreatePaymentSheetComponent } from '../../components/create-payment-sheet/create-payment-sheet.component';

export const PAYMENT_SHEET_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.GENERATE]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Create payment sheet?',
      icon: ICONS.COMMON.FILE,
      message:
        'A payment sheet will be created for the selected outstanding beneficiaries.',
      labels: {
        actionWord: 'create a payment sheet for',
        singleLabel: 'Create Payment Sheet',
        bulkLabel: 'Create Payment Sheet',
      },
    },
    dynamicComponent: CreatePaymentSheetComponent,
  },
};
