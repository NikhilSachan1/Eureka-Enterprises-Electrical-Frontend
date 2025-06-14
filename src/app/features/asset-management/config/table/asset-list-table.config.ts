import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const ASSET_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.ALLOCATE,
    label: 'Allocate',
    icon: 'pi pi-user-plus',
    severity: ESeverity.SUCCESS,
  },
  {
    id: EBulkActionType.DEALLOCATE,
    label: 'Deallocate',
    icon: 'pi pi-user-minus',
    severity: ESeverity.WARNING,
  },
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const ASSET_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Asset',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Asset',
    severity: ESeverity.DANGER,
  },
  {
    id: ERowActionType.ALLOCATE,
    icon: 'pi pi-user-plus',
    tooltip: 'Allocate Asset',
    severity: ESeverity.SUCCESS,
  },
  {
    id: ERowActionType.DEALLOCATE,
    icon: 'pi pi-user-minus',
    tooltip: 'Deallocate Asset',
    severity: ESeverity.WARNING,
  },
];

export const ASSET_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'assetName',
    'assetModel',
    'serialNumber',
    'usage',
    'status',
    'allocatedTo',
  ],
};

export const ASSET_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'assetName',
    header: 'Asset Name',
    filterConfig: {
      filterField: 'assetName',
      placeholder: 'Search Asset Name',
    },
  },
  {
    field: 'assetModel',
    header: 'Model & Serial Number',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'serialNumber',
      primaryFieldLabel: 'Model',
      secondaryFieldLabel: 'Serial Number',
    },
    filterConfig: {
      filterField: 'serialNumber',
      placeholder: 'Search By Serial Number',
    },
  },
  {
    field: 'usage',
    header: 'Usage',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'usage',
      placeholder: 'Search By Usage',
    },
  },
  {
    field: 'status',
    header: 'Allocation Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'status',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Allocated',
        'Available',
      ],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'calibrationFrom',
    header: 'Calibration From',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'calibrationFrom',
      placeholder: 'Search By Calibration From',
    },
  },
  {
    field: 'calibrationStartDate',
    header: 'Calibration Period',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    dataType: ETableDataType.DATE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'calibrationEndDate',
      primaryFieldLabel: 'Start Date',
      secondaryFieldLabel: 'End Date',
      dataType: ETableDataType.DATE,
    },
    filterConfig: {
      filterField: 'calibrationStartDate',
      placeholder: 'Search By Calibration Date',
      matchModeOptions: MATCH_MODE_OPTIONS.date,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'allocatedTo',
    header: 'Allocated To',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'employeeId',
      showImage: true,
      dummyImageField: 'allocatedTo',
    },
    filterConfig: {
      filterField: 'allocatedTo',
      placeholder: 'Search By Allocated Employee',
    },
  },
  {
    field: 'assetCertificate',
    header: 'Asset Certificate',
    bodyTemplate: ETableBodyTemplate.FILE_LINK,
    showFilter: false,
    showSort: false,
  },
]; 