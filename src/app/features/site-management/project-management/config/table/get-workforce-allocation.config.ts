import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IWorkforceAllocationGetBaseResponseDto } from '../../types/project.dto';
import { IWorkforceAllocation } from '../../types/workforce-allocation.interface';

const isFreeStatus = (row: IWorkforceAllocationGetBaseResponseDto): boolean =>
  row.status === 'FREE';

export const WORKFORCE_ALLOCATION_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No workforce allocation records found.',
};

export const WORKFORCE_ALLOCATION_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'employeeName',
      header: 'Employee',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'employeeCode' },
      showImage: true,
      dummyImageField: 'employeeName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'role',
      header: 'Role',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    {
      field: 'allocatedStatus',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'projectName',
      header: 'Project',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      icon: ICONS.SITE.BUILDING,
      dummyImageField: 'projectName',
      primaryFieldHighlight: true,
      subtitle: { field: 'projectLocation' },
      showSort: false,
    },
    {
      field: 'companyName',
      header: 'Company',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      icon: ICONS.COMMON.BRIEFCASE,
      dummyImageField: 'companyName',
      primaryFieldHighlight: true,
      subtitle: { field: 'companyLocation' },
      showSort: false,
    },
    {
      field: 'allocatedSince',
      header: 'Allocated Since',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
      showSort: false,
    },
  ];

const WORKFORCE_ALLOCATION_DISABLED_TOOLTIP = {
  deallocateWhenFree: 'Employee is free and has no active allocation.',
  transferWhenFree:
    'Employee must be allocated before they can be transferred.',
} as const;

const WORKFORCE_ALLOCATION_ALLOCATE_ACTION_CONFIG: Partial<
  ITableActionConfig<IWorkforceAllocationGetBaseResponseDto>
> = {
  id: EButtonActionType.ALLOCATE,
  permission: [APP_PERMISSION.PROJECT.ALLOCATE_DEALLOCATE_EMPLOYEE],
};

const WORKFORCE_ALLOCATION_DEALLOCATE_ACTION_CONFIG: Partial<
  ITableActionConfig<IWorkforceAllocationGetBaseResponseDto>
> = {
  id: EButtonActionType.DEALLOCATE,
  permission: [APP_PERMISSION.PROJECT.ALLOCATE_DEALLOCATE_EMPLOYEE],
  disableWhen: isFreeStatus,
  disableReason: () => WORKFORCE_ALLOCATION_DISABLED_TOOLTIP.deallocateWhenFree,
};

export const WORKFORCE_ALLOCATION_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IWorkforceAllocationGetBaseResponseDto>
>[] = [
  {
    ...WORKFORCE_ALLOCATION_ALLOCATE_ACTION_CONFIG,
    tooltip: 'Allocate Employee',
  },
  {
    id: EButtonActionType.TRANSFER,
    tooltip: 'Transfer Employee',
    permission: [APP_PERMISSION.PROJECT.ALLOCATE_DEALLOCATE_EMPLOYEE],
    disableWhen: isFreeStatus,
    disableReason: () => WORKFORCE_ALLOCATION_DISABLED_TOOLTIP.transferWhenFree,
  },
  {
    ...WORKFORCE_ALLOCATION_DEALLOCATE_ACTION_CONFIG,
    tooltip: 'Deallocate Employee',
  },
  {
    id: EButtonActionType.EVENT_HISTORY,
    tooltip: 'View allocation history',
    icon: ICONS.COMMON.HISTORY,
    permission: [APP_PERMISSION.PROJECT.ALLOCATION_HISTORY_TABLE_VIEW],
  },
];

export const WORKFORCE_ALLOCATION_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IWorkforceAllocationGetBaseResponseDto>
>[] = [
  {
    ...WORKFORCE_ALLOCATION_ALLOCATE_ACTION_CONFIG,
    label: 'Allocate',
    tooltip: 'Allocate Selected Employees',
  },
  {
    ...WORKFORCE_ALLOCATION_DEALLOCATE_ACTION_CONFIG,
    label: 'Deallocate',
    tooltip: 'Deallocate Selected Employees',
  },
];

export const WORKFORCE_ALLOCATION_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IWorkforceAllocation> =
  {
    tableConfig: WORKFORCE_ALLOCATION_TABLE_CONFIG,
    headers: WORKFORCE_ALLOCATION_TABLE_HEADER_CONFIG,
    rowActions:
      WORKFORCE_ALLOCATION_TABLE_ROW_ACTIONS_CONFIG as IEnhancedTableConfig<IWorkforceAllocation>['rowActions'],
    bulkActions:
      WORKFORCE_ALLOCATION_TABLE_BULK_ACTIONS_CONFIG as IEnhancedTableConfig<IWorkforceAllocation>['bulkActions'],
  };
