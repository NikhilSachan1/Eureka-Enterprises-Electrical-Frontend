import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import {
  IWorkforceAllocationActionFormDto,
  WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG,
} from '../../config/form/action-workforce-allocation.config';
import { IWorkforceAllocationGetBaseResponseDto } from '../../types/project.dto';

@Component({
  selector: 'app-action-workforce-allocation',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-workforce-allocation.component.html',
  styleUrl: './action-workforce-allocation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionWorkforceAllocationComponent
  extends FormBase<IWorkforceAllocationActionFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IWorkforceAllocationGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required for workforce allocation action but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IWorkforceAllocationActionFormDto>(
      WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.logger.logUserAction('Workforce allocation action form submitted', {
      actionType: this.dialogActionType(),
      formData: this.form.getData(),
      selectedRecord: this.selectedRecord()[0],
    });
    this.isSubmitting.set(false);
    this.confirmationDialogService.closeDialog();
  }
}
