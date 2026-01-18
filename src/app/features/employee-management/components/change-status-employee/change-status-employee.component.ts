import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeChangeStatusFormDto,
  IEmployeeChangeStatusResponseDto,
  IEmployeeGetBaseResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FORM_VALIDATION_MESSAGES, ICONS } from '@shared/constants';
import { EMPLOYEE_MESSAGES } from '../../constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { finalize } from 'rxjs';
import { EEmployeeStatus } from '@features/employee-management/types/employee.types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-change-status-employee',
  imports: [CommonModule],
  templateUrl: './change-status-employee.component.html',
  styleUrl: './change-status-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusEmployeeComponent extends FormBase implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<IEmployeeGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly ALL_EMPLOYMENT_TYPES = EEmployeeStatus;
  protected readonly ICONS = ICONS;

  protected readonly currentStatus = computed(() => {
    const record = this.selectedRecord();
    return record?.[0].status;
  });

  protected readonly newStatus = computed(() => {
    const current = this.currentStatus();
    return current === this.ALL_EMPLOYMENT_TYPES.ACTIVE
      ? this.ALL_EMPLOYMENT_TYPES.ARCHIVED
      : this.ALL_EMPLOYMENT_TYPES.ACTIVE;
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
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const { id: employeeId } = this.selectedRecord()[0];

    const formData = this.prepareFormData();
    this.executeEmployeeChangeStatusAction(formData, employeeId);
  }

  private prepareFormData(): IEmployeeChangeStatusFormDto {
    return {
      employeeStatus: this.newStatus(),
    };
  }

  private executeEmployeeChangeStatusAction(
    formData: IEmployeeChangeStatusFormDto,
    employeeId: string
  ): void {
    const loadingMessage = {
      title: EMPLOYEE_MESSAGES.LOADING.CHANGE_STATUS,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.CHANGE_STATUS,
    };
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
        next: (_response: IEmployeeChangeStatusResponseDto) => {
          this.notificationService.success(
            EMPLOYEE_MESSAGES.SUCCESS.CHANGE_STATUS
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(EMPLOYEE_MESSAGES.ERROR.CHANGE_STATUS, error);
          this.notificationService.error(EMPLOYEE_MESSAGES.ERROR.CHANGE_STATUS);
        },
      });
  }

  protected getStatusLabel(status: string): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.employeeStatus(),
      status
    );
  }
}
