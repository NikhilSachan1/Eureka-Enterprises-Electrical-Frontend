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
  IEmployeeGetBaseResponseDto,
  IEmployeeSendPasswordLinkRequestDto,
  IEmployeeSendPasswordLinkResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-send-password-link-employee',
  imports: [],
  templateUrl: './send-password-link-employee.component.html',
  styleUrl: './send-password-link-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendPasswordLinkEmployeeComponent implements OnInit {
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
        'Selected record is required to send password link to employee but was not provided'
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
  ): IEmployeeSendPasswordLinkRequestDto {
    return {
      userIds: record.map((row: IEmployeeGetBaseResponseDto) => row.id),
    };
  }

  private executeEmployeeDeleteAction(
    formData: IEmployeeSendPasswordLinkRequestDto
  ): void {
    const loadingMessage = {
      title: 'Sending Password Link to Employee',
      message:
        'Please wait while we send the password link to the employee(s)...',
    };
    this.isSubmitting.set(true);
    this.loadingService.show(loadingMessage);

    this.employeeService
      .sendPasswordLink(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEmployeeSendPasswordLinkResponseDto) => {
          const { results } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'employee',
            actionLabel: 'Send Password Link',
            errors: [],
            result: results,
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
