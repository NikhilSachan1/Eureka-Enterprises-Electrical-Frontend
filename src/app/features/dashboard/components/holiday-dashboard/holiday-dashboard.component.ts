import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { DashboardCelebrationsSectionComponent } from '@features/dashboard/components/dashboard-celebrations-section/dashboard-celebrations-section.component';
import { DashboardService } from '@features/dashboard/services/dashboard.services';
import { IHolidaysDashboardGetResponseDto } from '@features/dashboard/types/dashboard.dto';
import { IDashboardCelebrationRow } from '@features/dashboard/types/dashboard.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-holiday-dashboard',
  imports: [DashboardCelebrationsSectionComponent],
  templateUrl: './holiday-dashboard.component.html',
  styleUrl: './holiday-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HolidayDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);

  private readonly holidays = signal<IHolidaysDashboardGetResponseDto | null>(
    null
  );

  protected readonly holidaysLoading = signal(true);

  protected readonly holidaysRows = computed<IDashboardCelebrationRow[]>(() =>
    this.buildHolidays(this.holidays())
  );

  ngOnInit(): void {
    this.loadHolidays();
  }

  private loadHolidays(): void {
    this.dashboardService
      .getHolidays()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.holidaysLoading.set(false))
      )
      .subscribe({
        next: (response: IHolidaysDashboardGetResponseDto) => {
          this.holidays.set(response);
          this.logger.logUserAction('Holidays loaded successfully');
        },
        error: error => {
          this.logger.logUserAction('Failed to load holidays', error);
        },
      });
  }

  private buildHolidays(
    data: IHolidaysDashboardGetResponseDto | null
  ): IDashboardCelebrationRow[] {
    return (
      data?.map(
        (holiday): IDashboardCelebrationRow => ({
          label: holiday.name,
          value: holiday.date,
          daysLeft: holiday.daysUntil,
        })
      ) ?? []
    );
  }
}
