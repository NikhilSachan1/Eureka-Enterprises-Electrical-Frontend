import { applyIconsToDropdownOptions } from '@shared/config/dropdown-option-icons.config';
import { CONFIGURATION_KEYS } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

export function mapProjectSiteTypeDisplays(
  siteTypes: readonly string[] | null | undefined,
  options: IOptionDropdown[]
): IOptionDropdown[] {
  const optionsWithIcons = applyIconsToDropdownOptions(
    CONFIGURATION_KEYS.PROJECT.PROJECT_TYPES,
    options
  );

  return (siteTypes ?? []).map(value => {
    const option = optionsWithIcons.find(
      item =>
        item.value === value ||
        String(item.value).toLowerCase() === String(value).toLowerCase()
    );

    return (
      option ?? {
        label: String(
          getMappedValueFromArrayOfObjects(optionsWithIcons, value)
        ),
        value,
      }
    );
  });
}

export function projectSiteTypeTagVariant(value: string): string {
  const key = value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

  if (key === 'electrical') {
    return 'electrical';
  }

  if (key === 'civil') {
    return 'civil';
  }

  return 'default';
}
