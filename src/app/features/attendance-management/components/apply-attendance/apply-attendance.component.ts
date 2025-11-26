import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConfigService } from '@core/services/app-config.service';
import { LoggerService } from '@core/services/logger.service';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceApplyRequestDto,
  IAttendanceCurrentStatusGetResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { IAttendanceCurrentStatus } from '@features/attendance-management/types/attendance.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  IFormButtonConfig,
  EButtonSeverity,
  IPageHeaderConfig,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { stringToArray } from '@shared/utility';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  EApplyAttendanceAction,
  EAttendanceStatus,
} from '@features/attendance-management/types/attendance.enum';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-apply-attendance',
  imports: [
    PageHeaderComponent,
    DatePipe,
    SecondsToDhmsPipe,
    TextCasePipe,
    ButtonComponent,
  ],
  templateUrl: './apply-attendance.component.html',
  styleUrl: './apply-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyAttendanceComponent implements OnInit {
  protected readonly appConfig = inject(AppConfigService);
  protected readonly attendanceService = inject(AttendanceService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly logger = inject(LoggerService);
  protected readonly routerNavigationService = inject(RouterNavigationService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly destroyRef = inject(DestroyRef);

  protected readonly currentStatusData =
    signal<IAttendanceCurrentStatus | null>(null);
  protected readonly isSubmitting = signal(false);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly buttonConfig = computed(() => this.getButtonConfig());

  protected readonly allAttendanceStatus = EAttendanceStatus;
  protected readonly allApplyAttendanceAction = EApplyAttendanceAction;
  protected readonly todayDate = new Date();

  ngOnInit(): void {
    this.loadCurrentStatusDataFromRoute();
  }

  private loadCurrentStatusDataFromRoute(): void {
    const currentStatusDataFromRoute = this.activatedRoute.snapshot.data[
      'currentStatus'
    ] as IAttendanceCurrentStatusGetResponseDto;

    if (!currentStatusDataFromRoute) {
      this.logger.logUserAction('No current status data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.ATTENDANCE,
        ROUTES.ATTENDANCE.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const currentStatusData = this.prepareCurrentStatusData(
      currentStatusDataFromRoute
    );
    this.currentStatusData.set(currentStatusData);
  }

  prepareCurrentStatusData(
    currentStatusData: IAttendanceCurrentStatusGetResponseDto
  ): IAttendanceCurrentStatus {
    const [clientName, locationName] = stringToArray(
      currentStatusData.notes ?? '',
      '-'
    );

    return {
      status: currentStatusData.status,
      workDuration: currentStatusData.workDuration ?? 0,
      checkInTime: currentStatusData.checkInTime
        ? (new Date(currentStatusData.checkInTime) as unknown as string)
        : '',
      checkOutTime: currentStatusData.checkOutTime
        ? (new Date(currentStatusData.checkOutTime) as unknown as string)
        : '',
      locationName,
      clientName,
      associateEmployeeName: 'Mukesh Sawan',
    };
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Apply Attendance',
      subtitle: 'Check in or check out from your assigned location',
      showHeaderButton: false,
    };
  }

  protected applyAttendance(
    applyAttendanceStatus: EApplyAttendanceAction
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Apply Attendance',
      message: 'Please wait while we apply attendance...',
    });

    const formData = this.prepareFormData(applyAttendanceStatus);

    this.attendanceService
      .applyAttendance(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          const routeSegments = [
            ROUTE_BASE_PATHS.ATTENDANCE,
            ROUTES.ATTENDANCE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
          this.notificationService.success('Attendance applied successfully');
        },
        error: () => {
          this.notificationService.error('Failed to apply attendance');
        },
      });
  }

  private prepareFormData(
    applyAttendanceStatus: EApplyAttendanceAction
  ): IAttendanceApplyRequestDto {
    return {
      notes: `${this.currentStatusData()?.clientName} - ${this.currentStatusData()?.locationName}`,
      action: applyAttendanceStatus,
    };
  }

  private getButtonConfig(): IFormButtonConfig {
    return {
      checkIn: {
        label: 'Check In',
        type: 'button',
        severity: EButtonSeverity.SUCCESS,
        icon: 'pi pi-sign-in',
      },
      checkOut: {
        label: 'Check Out',
        type: 'button',
        severity: EButtonSeverity.DANGER,
        icon: 'pi pi-sign-out',
      },
    };
  }
}
