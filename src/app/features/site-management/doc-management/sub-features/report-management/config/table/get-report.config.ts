import { COMMON_ROW_ACTIONS } from '@shared/config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IReportGetResponseDto } from '../../types/report.dto';

export const REPORT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No report record found.',
};

const REPORT_TABLE_PARTY_CONTRACTOR: Partial<IDataTableHeaderConfig> = {
  field: 'contractor.name',
  header: 'Contractor Name',
  dummyImageField: 'contractor.name',
  bodyTemplate: EDataType.TEXT,
  showImage: true,
  primaryFieldHighlight: true,
  showSort: false,
};

const REPORT_TABLE_PARTY_VENDOR: Partial<IDataTableHeaderConfig> = {
  ...REPORT_TABLE_PARTY_CONTRACTOR,
  field: 'vendor.name',
  header: 'Vendor Name',
  dummyImageField: 'vendor.name',
};

export const REPORT_TABLE_HEADERS_SHARED: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'company.name',
    header: 'Company',
    dummyImageField: 'company.name',
    bodyTemplate: EDataType.TEXT,
    showImage: true,
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'site.name',
    header: 'Site',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    dataType: EDataType.TEXT,
    showImage: true,
    icon: 'pi pi-building',
    dummyImageField: 'site.name',
    primaryFieldHighlight: true,
    subtitle: {
      field: 'siteCityStateSubtitle',
      bodyTemplate: EDataType.TEXT,
    },
    showSort: false,
  },
  {
    field: 'jmc.jmcNumber',
    header: 'JMC Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'reportNumber',
    header: 'Report Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'reportDate',
    header: 'Report Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    showSort: false,
  },
  {
    field: 'fileKeys',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
  },
];

const REPORT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IReportGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View report details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit report',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete report',
  },
];

export const REPORT_TABLE_ENHANCED_CONFIG = (
  docContext?: EDocContext | null
): IEnhancedTableConfig<IReportGetResponseDto['records'][number]> => {
  const partyColumn =
    docContext === EDocContext.PURCHASE
      ? REPORT_TABLE_PARTY_VENDOR
      : REPORT_TABLE_PARTY_CONTRACTOR;

  return {
    tableConfig: REPORT_TABLE_CONFIG,
    headers: [partyColumn, ...REPORT_TABLE_HEADERS_SHARED],
    rowActions: REPORT_TABLE_ROW_ACTIONS_CONFIG,
  };
};
