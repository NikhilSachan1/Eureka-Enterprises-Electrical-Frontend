import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { IVendorOutstandingGetBaseResponseDto } from '../../types/vendor-outstanding.dto';

export const VENDOR_OUTSTANDING_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vendor outstanding record found.',
  emptyMessageDescription: 'There are no pending vendor payments to be paid.',
};

export const VENDOR_OUTSTANDING_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'vendorName',
      header: 'Vendor Name',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'gstNumber' },
      showImage: true,
      dummyImageField: 'vendorName',
      primaryFieldHighlight: true,
      serverSideFilterAndSortConfig: {
        sortField: 'vendorName',
        filterField: 'vendorName',
      },
    },
    {
      field: 'bankDetails',
      header: 'Bank Details',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bankDetailsCell',
      columnStyleClass: 'cell-allow-wrap',
      showSort: false,
    },
    {
      field: 'pendingAmount',
      header: 'Pending Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.NUMBER,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      serverSideFilterAndSortConfig: {
        sortField: 'pendingAmount',
      },
      showSort: false,
    },
  ];

export function createVendorOutstandingTableEnhancedConfig(): IEnhancedTableConfig<IVendorOutstandingGetBaseResponseDto> {
  return {
    tableConfig: VENDOR_OUTSTANDING_TABLE_CONFIG,
    headers: VENDOR_OUTSTANDING_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };
}
