import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeChangeStatusRequestDto,
  IEmployeeChangeStatusResponseDto,
  IEmployeeGetBaseResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EMPLOYEE_STATUS_DATA } from '@shared/config/static-data.config';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { finalize } from 'rxjs';
import { EEmployeeStatus } from '@features/employee-management/types/employee.types';

@Component({
  selector: 'app-change-status-employee',
  imports: [CommonModule],
  templateUrl: './change-status-employee.component.html',
  styleUrl: './change-status-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusEmployeeComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly employeeService = inject(EmployeeService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IEmployeeGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly isSubmitting = signal(false);

  protected readonly currentStatus = computed(() => {
    const record = this.selectedRecord();
    return record?.[0].status;
  });

  protected readonly newStatus = computed(() => {
    const current = this.currentStatus();
    return current === EEmployeeStatus.ACTIVE
      ? EEmployeeStatus.ARCHIVED
      : EEmployeeStatus.ACTIVE;
  });

  protected readonly currentStatusLabel = computed(() => {
    return this.getStatusLabel(this.currentStatus());
  });

  protected readonly newStatusLabel = computed(() => {
    return this.getStatusLabel(this.newStatus());
  });

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to change status of employee but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.onSubmit();
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    const { id: employeeId } = this.selectedRecord()[0];

    const formData = this.prepareFormData();
    this.executeEmployeeChangeStatusAction(formData, employeeId);
  }

  private prepareFormData(): IEmployeeChangeStatusRequestDto {
    return {
      status: this.newStatus(),
    };
  }

  protected getStatusLabel(status: string): string {
    const statusData = EMPLOYEE_STATUS_DATA.find(item => item.value === status);
    return statusData?.label ?? status;
  }

  private executeEmployeeChangeStatusAction(
    formData: IEmployeeChangeStatusRequestDto,
    employeeId: string
  ): void {
    const loadingMessage = {
      title: 'Changing Employee Status',
      message: 'Please wait while we change the employee status...',
    };
    this.isSubmitting.set(true);
    this.loadingService.show(loadingMessage);

    this.employeeService
      .changeEmployeeStatus(formData, employeeId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEmployeeChangeStatusResponseDto) => {
          const { message } = response;
          this.notificationService.success(message);

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
