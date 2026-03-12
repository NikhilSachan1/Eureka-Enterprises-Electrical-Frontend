import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IRoleDeleteFormDto,
  IRoleDeleteResponseDto,
  IRoleGetBaseResponseDto,
} from '../../types/role.dto';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { RoleService } from '../../services/role.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-role',
  imports: [],
  templateUrl: './delete-role.component.html',
  styleUrl: './delete-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteRoleComponent
  extends FormBase<IRoleDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly roleService = inject(RoleService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IRoleGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeRoleDeleteAction(formData);
  }

  private prepareFormData(
    record: IRoleGetBaseResponseDto[]
  ): IRoleDeleteFormDto {
    return {
      roleIds: record.map((row: IRoleGetBaseResponseDto) => row.id),
    };
  }

  private executeRoleDeleteAction(formData: IRoleDeleteFormDto): void {
    const loadingMessage = {
      title: 'Deleting Role',
      message: 'Please wait while we delete the role...',
    };
    this.loadingService.show(loadingMessage);

    this.roleService
      .deleteRole(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRoleDeleteResponseDto) => {
          const { failed, success } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'role',
            actionLabel: EButtonActionType.DELETE,
            errors: failed,
            result: success,
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
