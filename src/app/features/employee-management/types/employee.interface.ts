import { IDataViewDetails } from '@shared/types';
import { IEmployeeGetBaseResponseDto } from './employee.dto';

export interface IEmployee
  extends Omit<
    IEmployeeGetBaseResponseDto,
    | 'firstName'
    | 'lastName'
    | 'profilePicture'
    | 'status'
    | 'employeeId'
    | 'roles'
    | 'fatherName'
    | 'emergencyContactNumber'
    | 'gender'
    | 'dateOfBirth'
    | 'bloodGroup'
    | 'houseNumber'
    | 'streetName'
    | 'landmark'
    | 'city'
    | 'state'
    | 'pinCode'
    | 'previousExperience'
    | 'degree'
    | 'branch'
    | 'passoutYear'
    | 'bankHolderName'
    | 'accountNumber'
    | 'bankName'
    | 'ifscCode'
    | 'esicNumber'
    | 'aadharNumber'
    | 'panNumber'
    | 'dlNumber'
    | 'uanNumber'
    | 'passportNumber'
    | 'createdAt'
    | 'updatedAt'
  > {
  employeeName: string;
  employeeCode: string;
  originalRawData: IEmployeeGetBaseResponseDto;
}

export interface IEmployeeDetailBasicInfo
  extends Omit<IDataViewDetails['entryData'][number], 'metadata'> {
  icon?: string;
  bgColor?: string;
}

export interface IEmployeeDocumentInfo {
  label: string;
  documentKey: string[];
  color: string;
}

export interface IEmployeeDetailData {
  title: string;
  icon: string;
  fields: IDataViewDetails['entryData'];
}

export interface IEmployeeDetailQuickInfo {
  employeeStatus: string;
  employeeDesignation: string;
  employeeEmployeeId: string;
  employeeName: string;
  employeeProfilePicture: string;
  avatarUrl: string;
  profilePictureUrl: string;
}

export interface IEmployeeAuditItem {
  label: string;
  name: string | null;
  date: string | null;
  icon: string;
  iconColor: string;
}

export interface IEmployeeDetail {
  quickInfo: IEmployeeDetailQuickInfo;
  basicInfo: IEmployeeDetailBasicInfo[];
  employeeDetail: IEmployeeDetailData[][];
  documentInfo: IEmployeeDocumentInfo[];
  allDocumentKeys: string[];
  auditInfo: IEmployeeAuditItem[];
}
