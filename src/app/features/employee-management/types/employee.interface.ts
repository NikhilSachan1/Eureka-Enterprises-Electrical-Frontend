import { IEmployeeGetBaseResponseDto } from './employee.dto';

export interface IEmployee
  extends Omit<
    IEmployeeGetBaseResponseDto,
    | 'firstName'
    | 'lastName'
    | 'profilePicture'
    | 'status'
    | 'employeeId'
    | 'role'
  > {
  employeeName: string;
  employeeCode: string;
  originalRawData: IEmployeeGetBaseResponseDto;
}
