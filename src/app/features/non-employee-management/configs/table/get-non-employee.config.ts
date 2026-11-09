import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { LOGIN_AS_ROW_ACTION } from '@features/auth-management/config/impersonate.config';
import { EEmployeeStatus } from '@features/employee-management/types/employee.types';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { INonEmployeeGetBaseResponseDto } from '../../schemas/non-employee.schema';

const NON_EMPLOYEE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No non employee record found.',
  emptyMessageDescription:
    "You don't have any non employee yet. Please add a non employee first.",
};

const NON_EMPLOYEE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'roleNames' },
    showImage: true,
    dummyImageField: 'name',
    primaryFieldHighlight: true,
    serverSideFilterAndSortConfig: {
      sortField: 'firstName',
    },
  },
  {
    field: 'email',
    header: 'Email ID',
    bodyTemplate: EDataType.EMAIL,
    showSort: false,
  },
  {
    field: 'contactNumber',
    header: 'Contact Number',
    bodyTemplate: EDataType.PHONE,
    showSort: false,
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: EDataType.STATUS,
    showSort: false,
  },
];

const NON_EMPLOYEE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<INonEmployeeGetBaseResponseDto>
>[] = [
  LOGIN_AS_ROW_ACTION,
  {
    id: EButtonActionType.SEND_PASSWORD_LINK,
    tooltip: 'Send Password Link',
    permission: [APP_PERMISSION.SYSTEM_USER.EDIT],
    disableWhen: (record: INonEmployeeGetBaseResponseDto) =>
      record.status !== EEmployeeStatus.ACTIVE,
    disableReason: () =>
      'Password link can only be sent to users with Active status.',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Non Employee',
    permission: [APP_PERMISSION.SYSTEM_USER.EDIT],
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Status',
    permission: [APP_PERMISSION.SYSTEM_USER.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Non Employee',
    permission: [APP_PERMISSION.SYSTEM_USER.DELETE],
    disableWhen: (record: INonEmployeeGetBaseResponseDto) =>
      record.status === EEmployeeStatus.ACTIVE,
    disableReason: () =>
      'Cannot delete a user while their status is Active. Change status first.',
  },
];

export const NON_EMPLOYEE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<INonEmployeeGetBaseResponseDto> =
  {
    tableConfig: NON_EMPLOYEE_TABLE_CONFIG,
    headers: NON_EMPLOYEE_TABLE_HEADER_CONFIG,
    rowActions: NON_EMPLOYEE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: [],
  };
