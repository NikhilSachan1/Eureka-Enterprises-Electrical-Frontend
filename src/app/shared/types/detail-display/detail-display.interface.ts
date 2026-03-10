import { EExpenseTransactionType } from '@features/expense-management/types/expense.enum';
import { EDataType } from '../common/data-types.type';
import { EFuelExpenseTransactionType } from '@features/transport-management/fuel-expense-management/types/fuel-expense.enum';

export interface IEntityViewDetails {
  name: string;
  subtitle?: string | null;
  showImage?: boolean;
}

export interface IDetailEntryData {
  label: string;
  value: string | number | null | string[] | Record<string, unknown>[];
  suffix?: string;
  prefix?: string;
  /** Body template type for display (e.g., RANGE, DATE, NUMBER, CURRENCY, STATUS). */
  type?: EDataType;
  /** Data type for value formatting within RANGE (e.g., DATE, NUMBER, CURRENCY). */
  dataType?: EDataType;
  /** Date/number format string (e.g., 'dd MMM yyyy', '1.0-2'). */
  format?: string;
  customTemplateKey?: string;
  metadata?: {
    transactionType?: EExpenseTransactionType | EFuelExpenseTransactionType;
  };
  permission?: string[];
}

export interface IDataViewDetails {
  status?: {
    approvalStatus?: string;
    entryType?: string;
  };
  entryData: IDetailEntryData[];
  approvalBy?: IUserAuditInfo;
  createdBy?: IUserAuditInfo;
  updatedBy?: IUserAuditInfo;
}

export interface IDataViewDetailsWithEntity {
  details: IDataViewDetails[];
  entity?: IEntityViewDetails;
}

interface IUserAuditInfo {
  user: IUserInfo | null | undefined;
  date?: string | null;
  notes?: string | null;
}

export interface IUserInfo {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  employeeId?: string | null;
}
