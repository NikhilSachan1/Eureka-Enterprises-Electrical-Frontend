import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FORCE_LEAVE_FORM_CONFIG } from '@features/leave-management/config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import {
  ILeaveForceFormDto,
  ILeaveForceResponseDto,
  ILeaveBalanceGetResponseDto,
} from '@features/leave-management/types/leave.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { LeaveBalanceCardsComponent } from '../../shared/components/leave-balance-cards/leave-balance-cards.component';
import { LeaveHolidayHintComponent } from '../../shared/components/leave-holiday-hint/leave-holiday-hint.component';
import { ILeaveHoliday } from '../../types/leave-holiday.dto';
import {
  financialYearsBetween,
  holidayInRangeMessage,
  holidaysInLeaveRange,
} from '../../utils/leave-holiday.util';

@Component({
  selector: 'app-force-leave',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    LeaveBalanceCardsComponent,
    LeaveHolidayHintComponent,
  ],
  templateUrl: './force-leave.component.html',
  styleUrl: './force-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceLeaveComponent
  extends FormBase<ILeaveForceFormDto>
  implements OnInit
{
  private readonly leaveService = inject(LeaveService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private trackedLeaveFields!: ITrackedFields<ILeaveForceFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly leaveBalance = signal<
    ILeaveBalanceGetResponseDto['records'][number] | null
  >(null);

  protected readonly selectedEmployeeName = computed(() => {
    const employeeName = this.trackedLeaveFields?.employeeName?.();
    return employeeName && typeof employeeName === 'string'
      ? employeeName
      : null;
  });

  protected readonly showRemainingForceLeaveFields = computed(() => {
    const employeeName = this.selectedEmployeeName();
    const balance = this.leaveBalance();

    if (!employeeName && !balance) {
      return true;
    }

    return !!balance && Number.parseFloat(balance.availableBalance) > 0;
  });

  ngOnInit(): void {
    this.form = this.formService.createForm<ILeaveForceFormDto>(
      FORCE_LEAVE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    const trackedFields: (keyof ILeaveForceFormDto)[] = [
      'employeeName',
      'leaveDate',
    ];
    this.trackedLeaveFields =
      this.formService.trackMultipleFieldChanges<ILeaveForceFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
    this.loadHolidays();
  }

  /** Holidays of the year(s) the picker covers: disabled in it and named under it. */
  protected readonly holidays = signal<ILeaveHoliday[]>([]);

  protected readonly leaveDateValue = computed(
    () => this.trackedLeaveFields?.leaveDate?.() ?? null
  );

  protected readonly leaveDateConfig = computed(() => {
    const config = this.form.fieldConfigs.leaveDate;
    return {
      ...config,
      dateConfig: {
        ...config.dateConfig,
        disabledDates: this.holidays().map(holiday => holiday.date),
      },
    };
  });

  private loadHolidays(): void {
    const { minDate, maxDate } =
      this.form.fieldConfigs.leaveDate.dateConfig ?? {};
    const today = new Date();
    this.leaveService
      .getHolidays(financialYearsBetween(minDate ?? today, maxDate ?? today))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(holidays => this.holidays.set(holidays));
  }

  override handleSubmit(): void {
    const clashes = holidaysInLeaveRange(
      this.holidays(),
      this.form.formGroup.get('leaveDate')?.value
    );
    if (clashes.length) {
      this.notificationService.error(holidayInRangeMessage(clashes));
      return;
    }
    const formData = this.prepareFormData();
    this.executeForceLeave(formData);
  }

  private prepareFormData(): ILeaveForceFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeForceLeave(formData: ILeaveForceFormDto): void {
    this.loadingService.show({
      title: 'Recording leave',
      message: "We're recording the leave. This will just take a moment.",
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
        next: (response: ILeaveForceResponseDto) => {
          this.notificationService.bulkOperationFromResponse(response, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? 'Force leave applied successfully.'
                  : `Force leave applied for ${count} day(s).`,
              error: () =>
                'Force leave could not be applied for one or more selected day(s).',
              empty: 'No leave days were processed.',
            },
          });
          const routeSegments = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: error => {
          this.logger.error('Failed to apply force leave', error);
          this.notificationService.error('Failed to apply force leave');
        },
      });
  }

  protected onReset(): void {
    this.confirmResetSingleForm(() => {
      this.onResetSingleForm();
    });
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Leave',
      subtitle: 'Force a leave on behalf of an employee',
    };
  }
}
