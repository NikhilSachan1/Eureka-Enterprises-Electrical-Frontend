import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { ISalaryStructureGetResponseDto } from '@features/payroll-management/types/payroll.dto';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const SALARY_STRUCTURE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  showCheckbox: false,
  emptyMessage: 'No salary structure record found.',
};

export const SALARY_STRUCTURE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'employeeName',
      header: 'Employee Name',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'employeeCode' },
      showImage: true,
      dummyImageField: 'employeeName',
      primaryFieldHighlight: true,
    },
    {
      field: 'effectiveFrom',
      header: 'Effective From',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'ctc',
      header: 'CTC',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.CURRENCY,
      showSort: false,
    },
  ];

export const SALARY_STRUCTURE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ISalaryStructureGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Salary Structure Details',
    permission: [APP_PERMISSION.SALARY_STRUCTURE.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Salary Structure',
    permission: [APP_PERMISSION.SALARY_STRUCTURE.EDIT],
  },
];

export const SALARY_STRUCTURE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  ISalaryStructureGetResponseDto['records'][number]
> = {
  tableConfig: SALARY_STRUCTURE_TABLE_CONFIG,
  headers: SALARY_STRUCTURE_TABLE_HEADER_CONFIG,
  rowActions: SALARY_STRUCTURE_TABLE_ROW_ACTIONS_CONFIG,
};
