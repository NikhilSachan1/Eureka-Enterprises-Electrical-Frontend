import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IUserGetBaseResponseDto,
  IUserPermissionDeleteFormDto,
  IUserPermissionDeleteResponseDto,
} from '../../types/user.dto';
import { IDialogActionHandler } from '@shared/types';
import { UserService } from '../../services/user.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-user-permission',
  imports: [],
  templateUrl: './delete-user-permission.component.html',
  styleUrl: './delete-user-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteUserPermissionComponent
  extends FormBase<IUserPermissionDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly userService = inject(UserService);
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
        'Selected record is required to delete user permission but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeUserPermissionDeleteAction(formData);
  }

  private prepareFormData(
    record: IUserGetBaseResponseDto[]
  ): IUserPermissionDeleteFormDto {
    return {
      employeeNames: record.map((row: IUserGetBaseResponseDto) => row.id),
    };
  }

  private executeUserPermissionDeleteAction(
    formData: IUserPermissionDeleteFormDto
  ): void {
    const loadingMessage = {
      title: 'Deleting User Permission',
      message:
        "We're removing the user permission. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.userService
      .deleteUserPermission(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUserPermissionDeleteResponseDto) => {
          this.notificationService.success(response.message);

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
