import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { ICONS } from '@shared/constants';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IMyFile } from '../../types/my-files.interface';

const MY_FILES_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'This folder is empty.',
  emptyMessageDescription: 'No files or folders found in this location.',
  emptyMessageIcon: ICONS.COMMON.FOLDER,
};

const MY_FILES_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Name',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'myFileName',
    showSort: false,
  },
  {
    field: 'itemKind',
    header: 'Type',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
    columnWidth: '9rem',
  },
  {
    field: 'formattedSize',
    header: 'Size',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
    columnWidth: '7rem',
  },
];

const MY_FILES_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IMyFile>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Rename',
    permission: [APP_PERMISSION.MY_FILES.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.MOVE,
    tooltip: 'Move',
    permission: [APP_PERMISSION.MY_FILES.MOVE],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete',
    permission: [APP_PERMISSION.MY_FILES.DELETE],
  },
];

export const MY_FILES_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IMyFile> = {
  tableConfig: MY_FILES_TABLE_CONFIG,
  headers: MY_FILES_TABLE_HEADER_CONFIG,
  rowActions: MY_FILES_TABLE_ROW_ACTIONS_CONFIG,
};
