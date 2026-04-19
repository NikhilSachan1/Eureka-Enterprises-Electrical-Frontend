import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import {
  IUserChangeRoleFormDto,
  IUserChangeRoleResponseDto,
  IUserGetBaseResponseDto,
} from '../../types/user.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CHANGE_USER_ROLE_FORM_CONFIG } from '../../config';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-user-role',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './change-user-role.component.html',
  styleUrl: './change-user-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeUserRoleComponent
  extends FormBase<IUserChangeRoleFormDto>
  implements OnInit
{
  private readonly userService = inject(UserService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  protected readonly appConfigurationService = inject(AppConfigurationService);

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
    const { roles } = record[0];
    const mappedRoles = roles.map(role => role.name);

    this.form = this.formService.createForm<IUserChangeRoleFormDto>(
      CHANGE_USER_ROLE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          employeeRoles: mappedRoles,
        },
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

  private prepareFormData(): IUserChangeRoleFormDto {
    const formData = this.form.getData();
    const roleList = this.appConfigurationService.roleList();
    const roleIds = (formData.employeeRoles ?? [])
      .map(roleName => {
        const option = roleList.find(opt => opt.value === roleName);
        const id = (option?.data as { id?: string })?.id;
        return id ?? roleName;
      })
      .filter(Boolean);
    return { ...formData, employeeRoles: roleIds };
  }

  private executeChangeUserRole(
    formData: IUserChangeRoleFormDto,
    employeeId: string
  ): void {
    this.loadingService.show({
      title: 'Updating user role',
      message: "We're updating the user role. This will just take a moment.",
    });

    this.userService
      .changeUserRole(formData, employeeId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: IUserChangeRoleResponseDto) => {
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
