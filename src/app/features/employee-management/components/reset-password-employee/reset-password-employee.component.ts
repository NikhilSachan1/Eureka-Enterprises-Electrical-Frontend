import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RESET_PASSWORD_EMPLOYEE_FORM_CONFIG } from '../../configs/form/reset-password-employee.config';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeGetBaseResponseDto,
  IEmployeeResetPasswordFormDto,
  IEmployeeResetPasswordResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { EMPLOYEE_MESSAGES } from '../../constants';

@Component({
  selector: 'app-reset-password-employee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reset-password-employee.component.html',
  styleUrl: './reset-password-employee.component.scss',
})
export class ResetPasswordEmployeeComponent
  extends FormBase<IEmployeeResetPasswordFormDto>
  implements OnInit, IDialogActionHandler
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
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reset employee password but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IEmployeeResetPasswordFormDto>(
      RESET_PASSWORD_EMPLOYEE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.form.formGroup
      .get('newPassword')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.formGroup
          .get('confirmPassword')
          ?.updateValueAndValidity({ emitEvent: false });
      });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const employeeId = this.selectedRecord()[0].id;
    this.executeEmployeeResetPasswordAction(this.prepareFormData(), employeeId);
  }

  private prepareFormData(): IEmployeeResetPasswordFormDto {
    return this.form.getData();
  }

  private executeEmployeeResetPasswordAction(
    formData: IEmployeeResetPasswordFormDto,
    employeeId: string
  ): void {
    this.loadingService.show({
      title: EMPLOYEE_MESSAGES.LOADING.RESET_PASSWORD,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.RESET_PASSWORD,
    });
    this.form.disable();

    this.employeeService
      .resetEmployeePassword(formData, employeeId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEmployeeResetPasswordResponseDto) => {
          this.notificationService.success(
            response.message || EMPLOYEE_MESSAGES.SUCCESS.RESET_PASSWORD
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(EMPLOYEE_MESSAGES.ERROR.RESET_PASSWORD, error);
          this.notificationService.error(
            EMPLOYEE_MESSAGES.ERROR.RESET_PASSWORD
          );
        },
      });
  }
}
