import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { ICONS } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { finalize } from 'rxjs';
import { INonEmployeeGetBaseResponseDto } from '../../schemas/non-employee.schema';
import { NonEmployeeService } from '../../services/non-employee.service';
import { EEmployeeStatus } from '@features/employee-management/types/employee.types';

@Component({
  selector: 'app-change-status-non-employee',
  imports: [CommonModule],
  templateUrl:
    '../../../employee-management/components/change-status-employee/change-status-employee.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusNonEmployeeComponent extends FormBase {
  private readonly nonEmployeeService = inject(NonEmployeeService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<INonEmployeeGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly ALL_EMPLOYMENT_TYPES = EEmployeeStatus;
  protected readonly ICONS = ICONS;

  protected readonly currentStatus = computed(
    () => this.selectedRecord()[0].status
  );

  protected readonly newStatus = computed(() =>
    this.currentStatus() === EEmployeeStatus.ACTIVE
      ? EEmployeeStatus.ARCHIVED
      : EEmployeeStatus.ACTIVE
  );

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    this.loadingService.show({
      title: 'Updating status',
      message:
        "We're updating this user's status. This will just take a moment.",
    });

    this.nonEmployeeService
      .changeNonEmployeeStatus(
        { employeeStatus: this.newStatus() },
        this.selectedRecord()[0].id
      )
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Status changed successfully');
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
        // ApiService already shows the reason returned by the backend.
        error: error =>
          this.logger.error('Failed to change non employee status', error),
      });
  }

  protected getStatusLabel(status: string): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.employeeStatus(),
      status
    );
  }
}
