import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { LoggerService } from '@core/services';
import { ApplyAttendanceComponent } from '@features/attendance-management/components/apply-attendance/apply-attendance.component';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import type { IAttendanceCurrentStatusGetResponseDto } from '@features/attendance-management/types/attendance.dto';
import { dashOutlinedLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-apply-attendance-dashboard',
  imports: [Card, ButtonComponent, ApplyAttendanceComponent],
  templateUrl: './apply-attendance-dashboard.component.html',
  styleUrl: './apply-attendance-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyAttendanceDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly attendanceService = inject(AttendanceService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ICONS = ICONS;

  protected readonly loading = signal(true);
  protected readonly currentStatus =
    signal<IAttendanceCurrentStatusGetResponseDto | null>(null);

  protected readonly openAttendanceButton = dashOutlinedLinkButton({
    label: 'My attendance',
    icon: ICONS.COMMON.EXTERNAL_LINK,
  });

  ngOnInit(): void {
    this.loadCurrentStatus();
  }

  protected loadCurrentStatus(): void {
    this.attendanceService
      .getAttendanceCurrentStatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.currentStatus.set(response);
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          this.logger.logUserAction('Failed to load current status', error);
        },
      });
  }

  protected openAttendance(): void {
    void this.router.navigate([
      '/',
      ROUTE_BASE_PATHS.ATTENDANCE,
      ROUTES.ATTENDANCE.LIST,
    ]);
  }
}
