import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteCompanyBankAccountComponent } from '../../components/delete-company-bank-account/delete-company-bank-account.component';
import { ChangeStatusCompanyBankAccountComponent } from '../../components/change-status-company-bank-account/change-status-company-bank-account.component';

export const COMPANY_BANK_ACCOUNT_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteCompanyBankAccountComponent,
  },
  [EButtonActionType.CHANGE_STATUS]: {
    dialogConfig: {
      header: 'Change bank account status',
      message: "Update this bank account's status? Review the change below.",
    },
    dynamicComponent: ChangeStatusCompanyBankAccountComponent,
  },
};
