import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeGetBaseResponseDto,
  IEmployeeSendPasswordLinkFormDto,
  IEmployeeSendPasswordLinkResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { EMPLOYEE_MESSAGES } from '../../constants';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-send-password-link-employee',
  imports: [],
  templateUrl: './send-password-link-employee.component.html',
  styleUrl: './send-password-link-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendPasswordLinkEmployeeComponent
  extends FormBase
  implements OnInit
{
  private readonly employeeService = inject(EmployeeService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IEmployeeGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

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
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeEmployeeSendPasswordLinkAction(formData);
  }

  private prepareFormData(
    record: IEmployeeGetBaseResponseDto[]
  ): IEmployeeSendPasswordLinkFormDto {
    return {
      employeeIds: record.map((row: IEmployeeGetBaseResponseDto) => row.id),
    };
  }

  private executeEmployeeSendPasswordLinkAction(
    formData: IEmployeeSendPasswordLinkFormDto
  ): void {
    const loadingMessage = {
      title: EMPLOYEE_MESSAGES.LOADING.SEND_PASSWORD_LINK,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.SEND_PASSWORD_LINK,
    };
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
          this.notificationService.bulkOperationFromResponse(response, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? EMPLOYEE_MESSAGES.SUCCESS.SEND_PASSWORD_LINK
                  : `Password link sent successfully for ${count} employees.`,
              error: () => EMPLOYEE_MESSAGES.ERROR.SEND_PASSWORD_LINK,
              empty: EMPLOYEE_MESSAGES.ERROR.SEND_PASSWORD_LINK,
            },
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(EMPLOYEE_MESSAGES.ERROR.SEND_PASSWORD_LINK, error);
          this.notificationService.error(
            EMPLOYEE_MESSAGES.ERROR.SEND_PASSWORD_LINK
          );
        },
      });
  }
}
