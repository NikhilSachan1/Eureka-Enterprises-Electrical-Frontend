import { EExpenseTransactionType } from '@features/expense-management/types/expense.enum';
import { EDataType } from '../common/data-types.type';

export interface IEmployeeViewDetails {
  name: string;
  employeeCode: string;
}

export interface IDataViewDetails {
  status?: {
    approvalStatus: string;
    entryType: string;
  };
  entryData: {
    label: string;
    value: string | number | null | string[];
    type?: EDataType;
    format?: string;
    metadata?: {
      transactionType?: EExpenseTransactionType;
    };
  }[];
  approvalBy?: IUserAuditInfo;
  createdBy?: IUserAuditInfo;
  updatedBy?: IUserAuditInfo;
}

export interface IDataViewDetailsWithEmployee {
  details: IDataViewDetails[];
  employee?: IEmployeeViewDetails;
}

interface IUserAuditInfo {
  name?: string | null;
  date?: string | null;
  notes?: string | null;
}
