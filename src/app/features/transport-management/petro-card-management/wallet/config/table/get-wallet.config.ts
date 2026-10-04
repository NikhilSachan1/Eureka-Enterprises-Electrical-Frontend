import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IWalletRechargeGetBaseResponseDto } from '../../types/petro-card-wallet.dto';

export const WALLET_RECHARGE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No recharges recorded.',
  emptyMessageDescription: 'Record a recharge to put money into the wallet.',
};

const rechargeHeaders: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'rechargeDate',
    header: 'Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    showSort: false,
  },
  {
    field: 'amount',
    header: 'Amount',
    bodyTemplate: EDataType.CURRENCY,
    dataType: EDataType.NUMBER,
    currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    showSort: false,
  },
  {
    field: 'referenceNumber',
    header: 'Reference',
    showSort: false,
  },
  {
    field: 'paymentMode',
    header: 'Payment Mode',
    showSort: false,
  },
];

const rechargeRowActions: Partial<
  ITableActionConfig<IWalletRechargeGetBaseResponseDto>
>[] = [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View recharge details',
      permission: [APP_PERMISSION.PETRO_CARD.WALLET_VIEW],
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: 'Edit recharge',
      permission: [APP_PERMISSION.PETRO_CARD.WALLET_MANAGE],
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: 'Delete recharge',
      permission: [APP_PERMISSION.PETRO_CARD.WALLET_MANAGE],
    },
  ];

export const WALLET_RECHARGE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IWalletRechargeGetBaseResponseDto> =
{
  tableConfig: WALLET_RECHARGE_TABLE_CONFIG,
  headers: rechargeHeaders,
  rowActions: rechargeRowActions,
};
