import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { ConfirmationDialogService } from '@shared/services';
import { finalize } from 'rxjs';
import { INonEmployeeGetBaseResponseDto } from '../../schemas/non-employee.schema';
import { NonEmployeeService } from '../../services/non-employee.service';

@Component({
  selector: 'app-delete-non-employee',
  imports: [],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteNonEmployeeComponent extends FormBase {
  private readonly nonEmployeeService = inject(NonEmployeeService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<INonEmployeeGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    this.loadingService.show({
      title: 'Deleting non employee',
      message: "We're removing this user. This will just take a moment.",
    });

    this.nonEmployeeService
      .deleteNonEmployee(this.selectedRecord()[0].id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Non employee deleted successfully');
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
        // ApiService already shows the reason returned by the backend.
        error: error =>
          this.logger.error('Failed to delete non employee', error),
      });
  }
}
