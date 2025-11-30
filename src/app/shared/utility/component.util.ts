import { IOptionDropdown } from '@shared/types';

export const getOriginalDataForSelectedRows = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TMapped extends Record<string, any>,
  TOriginal extends Record<string, unknown>,
>(
  selectedRows: TMapped[],
  originalData: TOriginal[],
  idField: keyof TMapped & keyof TOriginal = 'id' as keyof TMapped &
    keyof TOriginal
): TOriginal[] => {
  const selectedIds = selectedRows.map(row => row[idField]);
  return originalData.filter(record =>
    selectedIds.includes(record[idField] as never)
  );
};

export const filterOptionsByIncludeExclude = (
  options: IOptionDropdown[],
  includeValues: string[],
  excludeValues: string[]
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
