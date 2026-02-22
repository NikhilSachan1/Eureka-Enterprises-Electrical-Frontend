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
  value: string | number | null | string[];
  suffix?: string;
  prefix?: string;
  type?: EDataType;
  format?: string;
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
