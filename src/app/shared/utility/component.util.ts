import { IOptionDropdown } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from './object.util';
import { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';

export const filterOptionsByIncludeExclude = (
  options: IOptionDropdown[],
  includeValues: string[] = [],
  excludeValues: string[] = []
): IOptionDropdown[] => {
  if (includeValues.length > 0) {
    const includeSet = new Set(includeValues);
    options = options.filter(option => includeSet.has(option.value));
  }

  if (excludeValues.length > 0) {
    const excludeSet = new Set(excludeValues);
    options = options.filter(option => !excludeSet.has(option.value));
  }

  return options;
};

export const getSelectedEmployeeRole = (
  employeeId: string,
  employeeList: IOptionDropdown[]
): string[] => {
  const selectedEmployee = getMappedValueFromArrayOfObjects(
    employeeList,
    employeeId,
    'value',
    'data'
  ) as IEmployeeGetBaseResponseDto;
  return selectedEmployee.roles?.split(',') ?? [];
};
