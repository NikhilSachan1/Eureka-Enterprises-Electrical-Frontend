import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeChangeRoleFormDto,
  IEmployeeChangeRoleResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FormBase } from '@shared/base/form.base';
import { ConfirmationDialogService } from '@shared/services';
import { IUserGetBaseResponseDto } from '../../types/user.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CHANGE_USER_ROLE_FORM_CONFIG } from '../../config';

@Component({
  selector: 'app-change-user-role',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './change-user-role.component.html',
  styleUrl: './change-user-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeUserRoleComponent
  extends FormBase<IEmployeeChangeRoleFormDto>
  implements OnInit
{
  private readonly employeeService = inject(EmployeeService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IUserGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to change user role but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IEmployeeChangeRoleFormDto>(
      CHANGE_USER_ROLE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const { id: userId } = this.selectedRecord()[0];
    const formData = this.prepareFormData();
    this.executeChangeUserRole(formData, userId);
  }

  private prepareFormData(): IEmployeeChangeRoleFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeChangeUserRole(
    formData: IEmployeeChangeRoleFormDto,
    employeeId: string
  ): void {
    this.loadingService.show({
      title: 'Changing User Role',
      message: 'Please wait while we change the user role...',
    });

    this.employeeService
      .changeEmployeeRole(formData, employeeId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: IEmployeeChangeRoleResponseDto) => {
          this.notificationService.success('User role changed successfully');

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to change user role', error);
          this.notificationService.error('Failed to change user role');
        },
      });
  }
}
