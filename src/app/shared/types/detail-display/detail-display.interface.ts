import { EExpenseTransactionType } from '@features/expense-management/types/expense.enum';
import { EDataType } from '../common/data-types.type';

export interface IEntityViewDetails {
  name: string;
  subtitle: string;
  showImage?: boolean;
}

export interface IDetailEntryData {
  label: string;
  value: string | number | null | string[];
  type?: EDataType;
  format?: string;
  metadata?: {
    transactionType?: EExpenseTransactionType;
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
  name?: string | null;
  date?: string | null;
  notes?: string | null;
}
