import {
  IFuelExpenseDetailGetResponseDto,
  IFuelExpenseGetBaseResponseDto,
} from './fuel-expense.dto';

export interface IFuelExpense
  extends Pick<IFuelExpenseGetBaseResponseDto, 'id'> {
  fuelFillDate: string;
  employeeName: string;
  employeeCode: string;
  vehicle: {
    registrationNumber: string;
    vehicleModel: string;
  } | null;
  originalRawData: IFuelExpenseGetBaseResponseDto;
}

export interface IFuelExpenseDetailResolverResponse
  extends IFuelExpenseDetailGetResponseDto {
  preloadedFiles?: File[];
}
