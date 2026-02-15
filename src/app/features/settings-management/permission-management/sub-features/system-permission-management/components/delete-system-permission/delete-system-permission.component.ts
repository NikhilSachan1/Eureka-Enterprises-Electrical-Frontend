import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  ISystemPermissionDeleteFormDto,
  ISystemPermissionDeleteResponseDto,
  ISystemPermissionGetBaseResponseDto,
} from '../../types/system-permission.dto';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { SystemPermissionService } from '../../services/system-permission.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-system-permission',
  imports: [],
  templateUrl: './delete-system-permission.component.html',
  styleUrl: './delete-system-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteSystemPermissionComponent
  extends FormBase<ISystemPermissionDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<ISystemPermissionGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete system permission but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeSystemPermissionDeleteAction(formData);
  }

  private prepareFormData(
    record: ISystemPermissionGetBaseResponseDto[]
  ): ISystemPermissionDeleteFormDto {
    return {
      systemPermissionIds: record.map(
        (row: ISystemPermissionGetBaseResponseDto) => row.id
      ),
    };
  }

  private executeSystemPermissionDeleteAction(
    formData: ISystemPermissionDeleteFormDto
  ): void {
    const loadingMessage = {
      title: 'Deleting System Permission',
      message: 'Please wait while we delete the system permission...',
    };
    this.loadingService.show(loadingMessage);

    this.systemPermissionService
      .deleteSystemPermission(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISystemPermissionDeleteResponseDto) => {
          const { failed, success } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'permission',
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
