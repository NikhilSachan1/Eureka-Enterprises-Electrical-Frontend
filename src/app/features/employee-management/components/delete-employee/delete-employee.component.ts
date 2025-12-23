import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeDeleteRequestDto,
  IEmployeeDeleteResponseDto,
  IEmployeeGetBaseResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { EButtonActionType } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-employee',
  imports: [],
  templateUrl: './delete-employee.component.html',
  styleUrl: './delete-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteEmployeeComponent implements OnInit {
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

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete employee but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IEmployeeGetBaseResponseDto[]): void {
    if (this.isSubmitting()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeEmployeeDeleteAction(formData);
  }

  private prepareFormData(
    record: IEmployeeGetBaseResponseDto[]
  ): IEmployeeDeleteRequestDto {
    return {
      userIds: record.map((row: IEmployeeGetBaseResponseDto) => row.id),
    };
  }

  private executeEmployeeDeleteAction(
    formData: IEmployeeDeleteRequestDto
  ): void {
    const loadingMessage = {
      title: 'Deleting Employee',
      message: 'Please wait while we delete the employee...',
    };
    this.isSubmitting.set(true);
    this.loadingService.show(loadingMessage);

    this.employeeService
      .deleteEmployee(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEmployeeDeleteResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'employee',
            actionLabel: EButtonActionType.DELETE,
            errors,
            result,
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
