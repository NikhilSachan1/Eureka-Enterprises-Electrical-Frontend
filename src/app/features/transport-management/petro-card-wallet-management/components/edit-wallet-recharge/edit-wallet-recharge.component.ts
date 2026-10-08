import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { EDIT_WALLET_RECHARGE_FORM_CONFIG } from '../../config/form/edit-wallet-recharge.config';
import { PetroCardWalletService } from '../../services/petro-card-wallet.service';
import {
  IWalletRechargeEditUIFormDto,
  IWalletRechargeGetBaseResponseDto,
} from '../../types/petro-card-wallet.dto';

@Component({
  selector: 'app-edit-wallet-recharge',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-wallet-recharge.component.html',
  styleUrl: './edit-wallet-recharge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWalletRechargeComponent
  extends FormBase<IWalletRechargeEditUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly walletService = inject(PetroCardWalletService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IWalletRechargeGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit wallet recharge: selected record was not provided');
      this.confirmationDialogService.closeDialog();
      return;
    }

    this.form = this.formService.createForm<IWalletRechargeEditUIFormDto>(
      EDIT_WALLET_RECHARGE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          amount: Number(record.amount),
          rechargeDate: new Date(record.rechargeDate),
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeEdit(this.form.getData(), record.id);
  }

  private executeEdit(
    formData: IWalletRechargeEditUIFormDto,
    rechargeId: string
  ): void {
    this.loadingService.show({
      title: 'Updating recharge',
      message: "We're correcting this wallet recharge.",
    });
    this.form.disable();

    this.walletService
      .editRecharge(formData, rechargeId)
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
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to update wallet recharge', error);
        },
      });
  }
}
