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
import { ReactiveFormsModule } from '@angular/forms';
import { LoggerService, EnvironmentService } from '@core/services';
import { FORCE_LEAVE_FORM_CONFIG } from '@features/leave-management/config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import { ILeaveForceRequestDto } from '@features/leave-management/types/leave.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { transformDateFormat } from '@shared/utility';
import { finalize } from 'rxjs';
import { FORCE_LEAVE_PREFILLED_DATA } from '@shared/mock-data/force-leave.mock-data';

@Component({
  selector: 'app-force-leave',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
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
  private readonly environmentService = inject(EnvironmentService);

  protected form!: IEnhancedForm;
  protected readonly initialLeaveData = signal<Record<string, unknown> | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadMockData();
    this.form = this.formService.createForm(FORCE_LEAVE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialLeaveData(),
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeForceLeave(formData);
  }

  private prepareFormData(): ILeaveForceRequestDto {
    const formData = this.form.getData() as {
      leaveDate: Date[];
      description: string;
      employeeName: string;
    };
    const [startDate, endDate] = formData.leaveDate;
    return {
      fromDate: transformDateFormat(startDate),
      toDate: transformDateFormat(endDate),
      reason: formData.description,
      userId: formData.employeeName,
    };
  }

  private executeForceLeave(formData: ILeaveForceRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Force Leave',
      message: 'Please wait while we process the force leave...',
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
      subtitle: 'Force a leave on behalf of an employee',
    };
  }

  private loadMockData(): void {
    if (this.environmentService.isTestDataEnabled) {
      this.initialLeaveData.set(FORCE_LEAVE_PREFILLED_DATA);
    }
  }
}
