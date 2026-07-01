import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { IVendorBookPaymentTableRow } from '../../types/vendor-outstanding.interface';

export const VENDOR_OUTSTANDING_OPS_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No book payments found for this vendor.',
  emptyMessageDescription: 'Booked payment entries will appear here.',
  enableServerSide: false,
  showPaginator: false,
  showViewModeToggle: false,
};

export const VENDOR_OUTSTANDING_OPS_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'bookingDate',
      header: 'Booking Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'pendingAmount',
      header: 'Pending Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.NUMBER,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      showSort: false,
    },
  ];

export function createVendorOutstandingTableEnhancedConfig(): IEnhancedTableConfig<IVendorBookPaymentTableRow> {
  return {
    tableConfig: VENDOR_OUTSTANDING_OPS_TABLE_CONFIG,
    headers: VENDOR_OUTSTANDING_OPS_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };
}
