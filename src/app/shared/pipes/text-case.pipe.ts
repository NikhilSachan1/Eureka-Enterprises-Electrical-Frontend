import { Pipe, PipeTransform } from '@angular/core';
import {
  toCapitalize,
  toLowerCase,
  toTitleCase,
  toUpperCase,
} from '@shared/utility';

@Pipe({
  name: 'textCase',
})
export class TextCasePipe implements PipeTransform {
  transform(value: string, type: 'title' | 'capitalize' = 'title'): string {
    if (type === 'title') {
      return toTitleCase(value);
    } else if (type === 'capitalize') {
      return toCapitalize(value);
    } else if (type === 'lower') {
      return toLowerCase(value);
    } else if (type === 'upper') {
      return toUpperCase(value);
    }
    return value;
  }
}
