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
import { IBirthdaysDashboardGetResponseDto } from '@features/dashboard/types/dashboard.dto';
import { IDashboardCelebrationRow } from '@features/dashboard/types/dashboard.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-birthdays-dashboard',
  imports: [DashboardCelebrationsSectionComponent],
  templateUrl: './birthdays-dashboard.component.html',
  styleUrl: './birthdays-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthdaysDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);

  private readonly birthdays = signal<IBirthdaysDashboardGetResponseDto | null>(
    null
  );

  protected readonly birthdaysLoading = signal(true);

  protected readonly birthdaysRows = computed<IDashboardCelebrationRow[]>(() =>
    this.buildBirthdays(this.birthdays())
  );

  ngOnInit(): void {
    this.loadBirthdays();
  }

  private loadBirthdays(): void {
    this.dashboardService
      .getBirthdays()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.birthdaysLoading.set(false))
      )
      .subscribe({
        next: (response: IBirthdaysDashboardGetResponseDto) => {
          this.birthdays.set(response);
          this.logger.logUserAction('Birthdays loaded successfully');
        },
        error: error => {
          this.logger.logUserAction('Failed to load birthdays', error);
        },
      });
  }

  private buildBirthdays(
    data: IBirthdaysDashboardGetResponseDto | null
  ): IDashboardCelebrationRow[] {
    return (
      data?.map(
        (birthday): IDashboardCelebrationRow => ({
          label: birthday.name,
          value: birthday.date,
          imageUrl: birthday.profilePicture,
          daysLeft: birthday.daysUntil,
        })
      ) ?? []
    );
  }
}
