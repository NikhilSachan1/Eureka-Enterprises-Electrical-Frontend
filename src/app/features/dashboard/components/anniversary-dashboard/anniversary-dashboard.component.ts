import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ICONS } from '@shared/constants';
import { DatePipe } from '@angular/common';
import type { IDashboardWorkAnniversaryRow } from '@features/dashboard/types/dashboard.interface';
import {
  addDaysToIsoDate,
  celebrationTiming,
  dashboardTodayYmd,
} from '@features/dashboard/utils/dashboard-celebration-dates';

@Component({
  selector: 'app-anniversary-dashboard',
  host: { class: 'people-celebrations-panel' },
  imports: [DatePipe],
  templateUrl: './anniversary-dashboard.component.html',
  styleUrl: './anniversary-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnniversaryDashboardComponent {
  protected readonly ICONS = ICONS;
  protected readonly todayYmd = dashboardTodayYmd();
  protected readonly rows = signal<readonly IDashboardWorkAnniversaryRow[]>(
    this.buildMock()
  );

  protected celebrationDayState(isoYmd: string): {
    label: string;
    variant: 'today' | 'upcoming';
  } {
    return celebrationTiming(isoYmd, this.todayYmd);
  }

  private buildMock(): readonly IDashboardWorkAnniversaryRow[] {
    const today = this.todayYmd;
    return [
      {
        employeeName: 'Suresh Kulkarni',
        employeeCode: 'EMP-1120',
        date: today,
        years: 5,
      },
      {
        employeeName: 'Priya Nair',
        date: addDaysToIsoDate(today, 5),
        years: 3,
      },
      {
        employeeName: 'Vikram Singh',
        employeeCode: 'EMP-0555',
        date: addDaysToIsoDate(today, 11),
        years: 10,
      },
      {
        employeeName: 'Deepak Patil',
        employeeCode: 'EMP-1203',
        date: addDaysToIsoDate(today, 18),
        years: 1,
      },
    ];
  }
}
