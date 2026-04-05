import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { IDashboardHolidayRow } from '@features/dashboard/types/dashboard.interface';
import {
  addDaysToIsoDate,
  celebrationTiming,
  dashboardTodayYmd,
} from '@features/dashboard/utils/dashboard-celebration-dates';

@Component({
  selector: 'app-holiday-dashboard',
  host: { class: 'people-celebrations-panel' },
  imports: [DatePipe],
  templateUrl: './holiday-dashboard.component.html',
  styleUrl: './holiday-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HolidayDashboardComponent {
  protected readonly todayYmd = dashboardTodayYmd();
  protected readonly rows = signal<readonly IDashboardHolidayRow[]>(
    this.buildMock()
  );

  protected celebrationDayState(isoYmd: string): {
    label: string;
    variant: 'today' | 'upcoming';
  } {
    return celebrationTiming(isoYmd, this.todayYmd);
  }

  private buildMock(): readonly IDashboardHolidayRow[] {
    const today = this.todayYmd;
    return [
      { name: 'Company townhall (half day)', date: addDaysToIsoDate(today, 2) },
      { name: 'Maharashtra Day', date: addDaysToIsoDate(today, 6) },
      { name: 'Bakrid / Eid al-Adha', date: addDaysToIsoDate(today, 14) },
      { name: 'Muharram', date: addDaysToIsoDate(today, 22) },
      { name: 'Declared long weekend', date: addDaysToIsoDate(today, 28) },
    ];
  }
}
