import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { IWalletOutstandingGetBaseResponseDto } from '../../types/wallet-outstanding.dto';

export const WALLET_OUTSTANDING_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No wallet outstanding record found.',
  emptyMessageDescription:
    'There are no pending wallet recharges waiting for payment.',
  showCheckbox: true,
};

export const WALLET_OUTSTANDING_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'raisedBy',
      header: 'Raised By',
      bodyTemplate: EDataType.TEXT,
      showImage: true,
      dummyImageField: 'raisedBy',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'rechargeDate',
      header: 'Recharge Date',
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
    }
  ];

export function createWalletOutstandingTableEnhancedConfig(): IEnhancedTableConfig<IWalletOutstandingGetBaseResponseDto> {
  return {
    tableConfig: WALLET_OUTSTANDING_TABLE_CONFIG,
    headers: WALLET_OUTSTANDING_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };
}
