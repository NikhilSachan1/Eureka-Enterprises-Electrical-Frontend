import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ADD_USER_DELEGATION_FORM_CONFIG } from '@features/settings-management/delegation-management/config/form/add-user-delegation.config';
import { UserDelegationService } from '@features/settings-management/delegation-management/services/user-delegation.service';
import { IUserDelegationAddFormDto } from '@features/settings-management/delegation-management/types/user-delegation.dto';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-user-delegation',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-user-delegation.component.html',
  styleUrl: './add-user-delegation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserDelegationComponent
  extends FormBase<IUserDelegationAddFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly userDelegationService = inject(UserDelegationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    this.form = this.formService.createForm<IUserDelegationAddFormDto>(
      ADD_USER_DELEGATION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    this.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.form.getData();
    if (formData.managerName === formData.memberName) {
      this.notificationService.error(
        'A person cannot be delegated to manage their own entries.'
      );
      return;
    }
    this.executeGrantDelegation(formData);
  }

  private executeGrantDelegation(formData: IUserDelegationAddFormDto): void {
    this.loadingService.show({
      title: 'Granting delegation',
      message: 'This will just take a moment.',
    });
    this.form.disable();

    this.userDelegationService
      .addDelegation(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.notificationService.success(response.message);
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to grant delegation', error);
        },
      });
  }
}
