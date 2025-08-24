import { Pipe, PipeTransform } from '@angular/core';
import { convertSecondsToDhms } from '@shared/utility/date-time.util';

@Pipe({
  name: 'secondsToDhms',
})
export class SecondsToDhmsPipe implements PipeTransform {
  transform(value: number): string {
    return convertSecondsToDhms(value);
  }
}
