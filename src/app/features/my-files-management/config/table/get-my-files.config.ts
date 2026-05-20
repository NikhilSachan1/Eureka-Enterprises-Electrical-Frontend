import { ICONS } from '@shared/constants';
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
  emptyMessageIcon: ICONS.COMMON.INBOX,
};

const MY_FILES_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Name',
    bodyTemplate: EDataType.TEXT,
    showImage: true,
    iconField: 'itemIcon',
    backgroundSeedField: 'name',
    primaryFieldHighlight: true,
    customTemplateKey: 'myFileName',
    showSort: false,
  },
  {
    field: 'mimeType',
    header: 'File Type',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'formattedSize',
    header: 'Size',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
];

const MY_FILES_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IMyFile>
>[] = [];

export const MY_FILES_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IMyFile> = {
  tableConfig: MY_FILES_TABLE_CONFIG,
  headers: MY_FILES_TABLE_HEADER_CONFIG,
  rowActions: MY_FILES_TABLE_ROW_ACTIONS_CONFIG,
};
