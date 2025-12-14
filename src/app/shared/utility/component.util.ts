import { IOptionDropdown } from '@shared/types';

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
