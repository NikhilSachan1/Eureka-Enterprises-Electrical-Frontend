import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ILeaveHoliday } from '@features/leave-management/types/leave-holiday.dto';
import {
  holidayInRangeMessage,
  holidaysBetween,
  holidaysInLeaveRange,
} from '@features/leave-management/utils/leave-holiday.util';

/**
 * Under the leave date picker: the holidays that can't be picked (with their names), and a
 * warning when the chosen dates take one in.
 */
@Component({
  selector: 'app-leave-holiday-hint',
  templateUrl: './leave-holiday-hint.component.html',
  styleUrl: './leave-holiday-hint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveHolidayHintComponent {
  readonly holidays = input<ILeaveHoliday[]>([]);
  /** The picker's value: [start, end] or one date. */
  readonly selected = input<unknown>(null);
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);

  /** Holidays the picker can show (within its min / max). */
  protected readonly visible = computed(() =>
    holidaysBetween(
      this.holidays(),
      this.minDate() ?? this.holidays()[0]?.date,
      this.maxDate() ?? this.holidays().at(-1)?.date
    )
  );

  protected readonly clashMessage = computed(() => {
    const clashes = holidaysInLeaveRange(this.holidays(), this.selected());
    return clashes.length ? holidayInRangeMessage(clashes) : '';
  });
}
