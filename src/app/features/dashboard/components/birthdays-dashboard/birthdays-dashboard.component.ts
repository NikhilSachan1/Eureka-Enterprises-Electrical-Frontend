import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { IDashboardBirthdayRow } from '@features/dashboard/types/dashboard.interface';
import {
  addDaysToIsoDate,
  celebrationTiming,
  dashboardTodayYmd,
} from '@features/dashboard/utils/dashboard-celebration-dates';

@Component({
  selector: 'app-birthdays-dashboard',
  host: { class: 'people-celebrations-panel' },
  imports: [DatePipe],
  templateUrl: './birthdays-dashboard.component.html',
  styleUrl: './birthdays-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthdaysDashboardComponent {
  protected readonly todayYmd = dashboardTodayYmd();
  protected readonly rows = signal<readonly IDashboardBirthdayRow[]>(
    this.buildMock()
  );

  protected celebrationDayState(isoYmd: string): {
    label: string;
    variant: 'today' | 'upcoming';
  } {
    return celebrationTiming(isoYmd, this.todayYmd);
  }

  private buildMock(): readonly IDashboardBirthdayRow[] {
    const today = this.todayYmd;
    return [
      { employeeName: 'Anita Desai', employeeCode: 'EMP-0891', date: today },
      {
        employeeName: 'Rahul Verma',
        employeeCode: 'EMP-1042',
        date: addDaysToIsoDate(today, 3),
      },
      { employeeName: 'Kavita Menon', date: addDaysToIsoDate(today, 9) },
      {
        employeeName: 'Arjun Mehta',
        employeeCode: 'EMP-0777',
        date: addDaysToIsoDate(today, 16),
      },
    ];
  }
}
