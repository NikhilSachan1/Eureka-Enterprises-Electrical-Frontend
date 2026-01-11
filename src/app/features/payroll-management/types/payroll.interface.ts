import { ISalaryStructureGetBaseResponseDto } from './payroll.dto';

export interface ISalaryStructure
  extends Pick<
    ISalaryStructureGetBaseResponseDto,
    'id' | 'effectiveFrom' | 'ctc'
  > {
  employeeName: string;
  employeeCode: string;
  originalRawData: ISalaryStructureGetBaseResponseDto;
}

export interface IEmployeeAnnexure {
  earnings: {
    items: IEmployeeAnnexureItem[];
    total: number;
  };
  deductions: {
    items: IEmployeeAnnexureItem[];
    total: number;
  };
  employerBenefits: {
    items: IEmployeeAnnexureItem[];
    total: number;
  };
  salarySummary: {
    items: IEmployeeAnnexureSummaryItem[];
  };
  notPartCTC: {
    items: IEmployeeAnnexureItem[];
  };
  effectiveFrom: string;
  originalRawData: ISalaryStructureGetBaseResponseDto;
}

export interface IEmployeeAnnexureSummaryItem {
  title: string;
  monthlyValue: number;
  annualValue: number;
}

export interface IEmployeeAnnexureItem {
  label: string;
  value: number;
}

export interface IEmployeeSalaryRevisionHistoryItem
  extends Omit<IEmployeeAnnexure, 'originalRawData'> {
  changedByUser: string;
  changedAt: string;
  reason: string;
  isActive: boolean;
  changeType: string;
}

export interface ISalaryFields {
  basic: string;
  hra: string;
  tds: string;
  esic: string;
  employeePf: string;
}

export interface IEmployeeSalarySummaryItem {
  label: string;
  value: number;
  description: string;
}

export interface ISalaryDetailResolverResponse {
  basicSalary: string;
  hra: string;
  tds: string;
  employerEsicContribution: string;
  employeePfContribution: string;
  foodAllowance: string;
}
