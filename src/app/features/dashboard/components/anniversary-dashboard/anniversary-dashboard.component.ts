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
import { IAnniversariesDashboardGetResponseDto } from '@features/dashboard/types/dashboard.dto';
import { IDashboardCelebrationRow } from '@features/dashboard/types/dashboard.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-anniversary-dashboard',
  imports: [DashboardCelebrationsSectionComponent],
  templateUrl: './anniversary-dashboard.component.html',
  styleUrl: './anniversary-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnniversaryDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);

  private readonly anniversaries =
    signal<IAnniversariesDashboardGetResponseDto | null>(null);

  protected readonly anniversariesLoading = signal(true);

  protected readonly anniversariesRows = computed<IDashboardCelebrationRow[]>(
    () => this.buildAnniversaries(this.anniversaries())
  );

  ngOnInit(): void {
    this.loadAnniversaries();
  }

  private loadAnniversaries(): void {
    this.dashboardService
      .getAnniversaries()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.anniversariesLoading.set(false))
      )
      .subscribe({
        next: (response: IAnniversariesDashboardGetResponseDto) => {
          this.anniversaries.set(response);
          this.logger.logUserAction('Anniversaries loaded successfully');
        },
        error: error => {
          this.logger.logUserAction('Failed to load anniversaries', error);
        },
      });
  }

  private buildAnniversaries(
    data: IAnniversariesDashboardGetResponseDto | null
  ): IDashboardCelebrationRow[] {
    return (
      data?.map(
        (anniversary): IDashboardCelebrationRow => ({
          label: anniversary.name,
          value: anniversary.date,
          imageUrl: anniversary.profilePicture,
          daysLeft: anniversary.daysUntil,
          completedYears: anniversary.yearsCompleted,
        })
      ) ?? []
    );
  }
}
