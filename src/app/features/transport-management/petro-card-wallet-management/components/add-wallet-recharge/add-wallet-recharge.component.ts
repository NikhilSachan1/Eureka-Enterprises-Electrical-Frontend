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
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { ADD_WALLET_RECHARGE_FORM_CONFIG } from '../../config/form/add-wallet-recharge.config';
import { PetroCardWalletService } from '../../services/petro-card-wallet.service';
import { IWalletRechargeAddUIFormDto } from '../../types/petro-card-wallet.dto';

@Component({
  selector: 'app-add-wallet-recharge',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-wallet-recharge.component.html',
  styleUrl: './add-wallet-recharge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWalletRechargeComponent
  extends FormBase<IWalletRechargeAddUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly walletService = inject(PetroCardWalletService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    this.form = this.formService.createForm<IWalletRechargeAddUIFormDto>(
      ADD_WALLET_RECHARGE_FORM_CONFIG,
      { destroyRef: this.destroyRef }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAdd(this.form.getData());
  }

  private executeAdd(formData: IWalletRechargeAddUIFormDto): void {
    this.loadingService.show({
      title: 'Recording recharge',
      message: "We're adding this amount to the PetroCard wallet.",
    });
    this.form.disable();

    this.walletService
      .addRecharge(formData)
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
          this.notificationService.success(
            response.message ||
              'Recharge raised — balance will update after payment.'
          );
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to record wallet recharge', error);
        },
      });
  }
}
