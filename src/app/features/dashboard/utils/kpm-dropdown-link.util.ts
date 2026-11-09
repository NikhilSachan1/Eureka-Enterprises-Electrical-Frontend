import type { IOptionDropdown } from '@shared/types';

function normalizeOptionText(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function optionText(option: IOptionDropdown): string {
  return normalizeOptionText(`${option.value} ${option.label}`);
}

/** Resolve a dropdown option id from config lists using label/value text. */
export function pickDropdownValue(
  options: readonly IOptionDropdown[],
  kind: 'soon' | 'expired' | 'pending'
): string | undefined {
  if (kind === 'pending') {
    return options.find(option => optionText(option).includes('pending'))
      ?.value;
  }

  if (kind === 'soon') {
    return options.find(option => {
      const text = optionText(option);
      return (
        (text.includes('soon') || text.includes('due soon')) &&
        !text.includes('expired') &&
        !text.includes('overdue')
      );
    })?.value;
  }

  return options.find(option => {
    const text = optionText(option);
    return (
      (text.includes('expired') ||
        text.includes('overdue') ||
        text.includes('lapsed')) &&
      !text.includes('soon')
    );
  })?.value;
}

export function statusFilterQuery(
  field: string,
  value: string | undefined
): Record<string, string[]> | undefined {
  if (!value) {
    return undefined;
  }

  return { [field]: [value] };
}
