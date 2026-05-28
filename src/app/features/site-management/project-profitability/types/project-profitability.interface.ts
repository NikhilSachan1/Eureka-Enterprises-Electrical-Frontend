import { IProjectProfitabilityGetResponseDto } from './project-profitability.dto';

export type IProjectProfitabilityReport = IProjectProfitabilityGetResponseDto;

export type ProfitabilityDetailDialogType =
  | 'sales-invoices'
  | 'vendor-invoices'
  | 'employee-cost'
  | 'regular-expense-detail'
  | 'fuel-employee';

export type ProfitabilityDetailColumnType =
  | 'text'
  | 'currency'
  | 'date'
  | 'avatar'
  | 'vehicle'
  | 'expense-category';

export interface IProfitabilityDetailColumn {
  field: string;
  header: string;
  type: ProfitabilityDetailColumnType;
  amount?: boolean;
  subtitleField?: string;
  subtitlePrefix?: string;
}

export interface IProfitabilityDetailSection {
  title?: string;
  rows: Record<string, unknown>[];
  columns: IProfitabilityDetailColumn[];
  emptyDescription: string;
}
