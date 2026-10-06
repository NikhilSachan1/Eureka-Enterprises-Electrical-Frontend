import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { PetroCardWalletService } from '@features/transport-management/petro-card-management/wallet/services/petro-card-wallet.service';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { NotificationService } from '@shared/services';
import type { IInputFieldsConfig } from '@shared/types';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  finalize,
  map,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';

const PETRO_CARD_PAYMENT_MODE = 'petro_card';

@Component({
  selector: 'app-fuel-expense-amount-field',
  imports: [InputFieldComponent],
  templateUrl: './fuel-expense-amount-field.component.html',
  styleUrl: './fuel-expense-amount-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelExpenseAmountFieldComponent {
  private readonly walletService = inject(PetroCardWalletService);
  private readonly notificationService = inject(NotificationService);

  readonly formGroup = input.required<FormGroup>();
  readonly fieldConfig = input.required<IInputFieldsConfig>();

  private readonly availableBalance = signal<number | null>(null);
  private readonly balanceLoading = signal(false);
  private readonly balanceHint = signal<string | undefined>(undefined);
  private readonly petroCardSelected = signal(false);

  private readonly balanceValidator: ValidatorFn = control => {
    if (!this.petroCardSelected()) {
      return null;
    }

    const balance = this.availableBalance();
    if (balance === null) {
      return null;
    }

    const amount = Number(control.value);
    // Mirror backend: refuse only when amount > balance (exact balance is allowed).
    if (!Number.isFinite(amount) || amount <= 0 || amount <= balance) {
      return null;
    }

    return {
      insufficientWalletBalance: this.buildInsufficientBalanceMessage(
        balance,
        amount
      ),
    };
  };

  private validatorAttached = false;

  protected readonly resolvedFieldConfig = computed<IInputFieldsConfig>(() => {
    const base = this.fieldConfig();
    if (!this.petroCardSelected()) {
      return base;
    }

    return {
      ...base,
      hint: this.balanceHint() ?? base.hint,
    };
  });

  constructor() {
    effect(onCleanup => {
      const formGroup = this.formGroup();
      const paymentModeControl = formGroup.get('paymentMode');
      const amountControl = this.resolveAmountControl(formGroup);

      if (!paymentModeControl || !amountControl) {
        return;
      }

      const subscription = new Subscription();
      subscription.add(
        paymentModeControl.valueChanges
          .pipe(
            startWith(paymentModeControl.value),
            map(mode => String(mode ?? '').trim().toLowerCase()),
            distinctUntilChanged(),
            switchMap(mode => {
              const isPetro = mode === PETRO_CARD_PAYMENT_MODE;
              this.petroCardSelected.set(isPetro);

              if (!isPetro) {
                this.resetBalanceState(amountControl);
                return EMPTY;
              }

              this.attachValidator(amountControl);
              this.balanceLoading.set(true);
              this.balanceHint.set('Loading PetroCard wallet balance…');

              return this.walletService.getBalance().pipe(
                catchError(() => {
                  this.availableBalance.set(null);
                  this.balanceHint.set(
                    'Could not load PetroCard wallet balance'
                  );
                  amountControl.updateValueAndValidity({ emitEvent: false });
                  return EMPTY;
                }),
                finalize(() => this.balanceLoading.set(false))
              );
            })
          )
          .subscribe(response => {
            this.availableBalance.set(response.balance);
            this.balanceHint.set(
              `Available balance: ${this.formatCurrency(response.balance)}`
            );
            amountControl.updateValueAndValidity({ emitEvent: false });
          })
      );

      onCleanup(() => {
        subscription.unsubscribe();
        this.resetBalanceState(amountControl);
      });
    });
  }

  /**
   * Submit-time guard for loading / fetch failures / clear toast.
   * Amount > balance is also blocked by the field validator.
   */
  ensureCanSubmit(): boolean {
    if (!this.petroCardSelected()) {
      return true;
    }

    if (this.balanceLoading()) {
      this.notificationService.error(
        'Checking PetroCard wallet balance. Please wait a moment.'
      );
      return false;
    }

    const balance = this.availableBalance();
    if (balance === null) {
      this.notificationService.error(
        'Could not load PetroCard wallet balance. Please try again.'
      );
      return false;
    }

    const amountControl = this.resolveAmountControl(this.formGroup());
    const amount = Number(amountControl?.value);
    if (Number.isFinite(amount) && amount > balance) {
      amountControl?.markAsTouched();
      amountControl?.updateValueAndValidity();
      this.notificationService.error(
        this.buildInsufficientBalanceMessage(balance, amount)
      );
      return false;
    }

    return true;
  }

  private resetBalanceState(amountControl: AbstractControl): void {
    this.availableBalance.set(null);
    this.balanceLoading.set(false);
    this.balanceHint.set(undefined);
    this.detachValidator(amountControl);
    amountControl.updateValueAndValidity({ emitEvent: false });
  }

  private attachValidator(control: AbstractControl): void {
    if (this.validatorAttached) {
      return;
    }
    control.addValidators(this.balanceValidator);
    this.validatorAttached = true;
  }

  private detachValidator(control: AbstractControl): void {
    if (!this.validatorAttached) {
      return;
    }
    control.removeValidators(this.balanceValidator);
    this.validatorAttached = false;
  }

  private resolveAmountControl(formGroup: FormGroup): AbstractControl | null {
    const fieldName = this.fieldConfig().fieldName || 'fuelAmount';
    return formGroup.get(fieldName);
  }

  private buildInsufficientBalanceMessage(
    available: number,
    needed: number
  ): string {
    return `Insufficient PetroCard Wallet balance. Available ${this.formatCurrency(available)}, this entry needs ${this.formatCurrency(needed)}. Recharge the wallet before recording this fuel entry.`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT || 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
