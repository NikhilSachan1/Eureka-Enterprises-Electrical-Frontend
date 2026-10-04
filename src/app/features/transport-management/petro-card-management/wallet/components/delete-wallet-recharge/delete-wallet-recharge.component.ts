import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { PetroCardWalletService } from '../../services/petro-card-wallet.service';

@Component({
  selector: 'app-delete-wallet-recharge',
  imports: [],
  templateUrl: './delete-wallet-recharge.component.html',
  styleUrl: './delete-wallet-recharge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteWalletRechargeComponent extends FormBase implements OnInit {
  private readonly walletService = inject(PetroCardWalletService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly rechargeId = input.required<string>();
  protected readonly onSuccess = input<(balance: number) => void>();

  ngOnInit(): void {
    if (!this.rechargeId()) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Wallet recharge id is required to delete');
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const rechargeId = this.rechargeId();
    if (!rechargeId) {
      return;
    }

    this.loadingService.show({
      title: 'Deleting recharge',
      message:
        "We're removing this recharge. The wallet balance updates on its own.",
    });

    this.walletService
      .deleteRecharge(rechargeId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.notificationService.success(response.message);
          this.onSuccess()?.(response.balance);
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete wallet recharge', error);
        },
      });
  }
}
