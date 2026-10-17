import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { IUserDelegationGetBaseResponseDto } from '@features/settings-management/delegation-management/types/user-delegation.dto';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonSeverity,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

const USER_DELEGATION_TABLE_CONFIG: Partial<IDataTableConfig> = {
  showCheckbox: false,
  emptyMessage: 'No delegations found.',
  emptyMessageIcon: ICONS.COMMON.USERS,
  emptyMessageDescription:
    'No one is assigned to handle another employee yet. Grant a delegation to get started.',
};

const USER_DELEGATION_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'managerName',
    header: 'Manager',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'managerEmployeeId' },
    showImage: true,
    dummyImageField: 'managerName',
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'memberName',
    header: 'Member',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'memberEmployeeId' },
    showImage: true,
    dummyImageField: 'memberName',
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'moduleLabel',
    header: 'Module',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'grantedByName',
    header: 'Granted by',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: {
      field: 'createdAt',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME,
    },
    showImage: true,
    dummyImageField: 'grantedByName',
    primaryFieldHighlight: true,
    showSort: false,
  },
];

const USER_DELEGATION_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IUserDelegationGetBaseResponseDto>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Withdraw delegation',
    icon: ICONS.ACTIONS.BAN,
    severity: EButtonSeverity.WARNING,
    permission: [APP_PERMISSION.USER_DELEGATION.MANAGE],
    hideWhen: row => row.isActive !== true,
  },
];

export const USER_DELEGATION_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IUserDelegationGetBaseResponseDto
> = {
  tableConfig: USER_DELEGATION_TABLE_CONFIG,
  headers: USER_DELEGATION_TABLE_HEADER_CONFIG,
  rowActions: USER_DELEGATION_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: [],
};
