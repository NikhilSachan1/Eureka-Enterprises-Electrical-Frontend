import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppConfigService, LoggerService } from '@core/services';
import { LeaveService } from '@features/leave-management/services/leave.service';
import {
  ELeaveDayType,
  ELeaveType,
} from '@features/leave-management/types/leave.enum';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FORCE_LEAVE_FORM_CONFIG } from '@features/leave-management/config/form/force-leave.config';
import { ILeaveForceRequestDto } from '@features/leave-management/types/leave.dto';

@Component({
  selector: 'app-force-leave',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  providers: [DatePipe],
  templateUrl: './force-leave.component.html',
  styleUrl: './force-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceLeaveComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly leaveService = inject(LeaveService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly datePipe = inject(DatePipe);
  private readonly appConfigService = inject(AppConfigService);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(FORCE_LEAVE_FORM_CONFIG);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeForceLeave(formData);
  }

  private prepareFormData(): ILeaveForceRequestDto {
    const { date, reason } = this.form.getData() as Record<string, string>;
    const { employeeName } = this.form.getData() as {
      employeeName: string;
    };

    const fromDate = new Date(date[0]);
    const toDate = new Date(date[1]);

    const formattedFromDate = this.datePipe.transform(
      fromDate,
      this.appConfigService.dateFormats.API
    ) as string;
    const formattedToDate = this.datePipe.transform(
      toDate,
      this.appConfigService.dateFormats.API
    ) as string;

    return {
      userId: employeeName,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
      reason,
      approvalReason: 'Auto Forced Leave Approved',
      leaveType: ELeaveDayType.FULL_DAY,
      leaveCategory: ELeaveType.EARNED,
    };
  }

  private executeForceLeave(formData: ILeaveForceRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Force Leave',
      message: 'Please wait while we force leave...',
    });
    this.form.disable();

    this.leaveService
      .forceLeave(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Leave forced successfully');
          const routeSegments = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to force leave');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Force leave form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Force Leave Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Leave',
      subtitle: 'Force leave for an employee',
    };
  }
}
