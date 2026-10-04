import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ADD_WALLET_RECHARGE_FORM_CONFIG } from '../../config/form/add-wallet-recharge.config';
import { PetroCardWalletService } from '../../services/petro-card-wallet.service';
import { IWalletRechargeAddUIFormDto } from '../../types/petro-card-wallet.dto';

@Component({
  selector: 'app-add-wallet-recharge',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-wallet-recharge.component.html',
  styleUrl: './add-wallet-recharge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWalletRechargeComponent
  extends FormBase<IWalletRechargeAddUIFormDto>
  implements OnInit
{
  private readonly walletService = inject(PetroCardWalletService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IWalletRechargeAddUIFormDto>(
      ADD_WALLET_RECHARGE_FORM_CONFIG,
      { destroyRef: this.destroyRef }
    );
  }

  protected override handleSubmit(): void {
    this.executeAdd(this.form.getData());
  }

  protected onReset(): void {
    this.onResetSingleForm();
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
          this.notificationService.success(response.message);
          void this.routerNavigationService.navigateToRoute([
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.PETRO_CARD,
            ROUTES.PETRO_CARD.WALLET,
          ]);
        },
        error: error => {
          this.logger.logUserAction('Failed to record wallet recharge', error);
        },
      });
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Record Recharge',
      subtitle: 'Add money to the shared PetroCard wallet',
    };
  }
}
