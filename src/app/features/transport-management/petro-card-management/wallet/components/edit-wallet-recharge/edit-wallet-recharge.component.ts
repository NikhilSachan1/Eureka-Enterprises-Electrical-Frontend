import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { EDIT_WALLET_RECHARGE_FORM_CONFIG } from '../../config/form/edit-wallet-recharge.config';
import { PetroCardWalletService } from '../../services/petro-card-wallet.service';
import {
  IWalletRechargeEditUIFormDto,
  IWalletRechargeGetBaseResponseDto,
} from '../../types/petro-card-wallet.dto';

@Component({
  selector: 'app-edit-wallet-recharge',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-wallet-recharge.component.html',
  styleUrl: './edit-wallet-recharge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWalletRechargeComponent
  extends FormBase<IWalletRechargeEditUIFormDto>
  implements OnInit
{
  private readonly walletService = inject(PetroCardWalletService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  private readonly initialRecharge = signal<IWalletRechargeEditUIFormDto | null>(
    null
  );

  ngOnInit(): void {
    this.loadRechargeFromRoute();
    this.form = this.formService.createForm<IWalletRechargeEditUIFormDto>(
      EDIT_WALLET_RECHARGE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialRecharge(),
      }
    );
  }

  protected override handleSubmit(): void {
    const rechargeId = this.activatedRoute.snapshot.params['rechargeId'] as
      | string
      | undefined;
    if (!rechargeId) {
      return;
    }
    this.executeEdit(this.form.getData(), rechargeId);
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private loadRechargeFromRoute(): void {
    const routeState =
      this.routerNavigationService.getRouterStateData<IWalletRechargeGetBaseResponseDto>(
        'rechargeData'
      );
    if (!routeState) {
      this.logger.logUserAction('No wallet recharge data found in route');
      void this.routerNavigationService.navigateToRoute([
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.PETRO_CARD,
        ROUTES.PETRO_CARD.WALLET,
      ]);
      return;
    }
    this.initialRecharge.set({
      amount: Number(routeState.amount),
      rechargeDate: new Date(routeState.rechargeDate),
      referenceNumber: routeState.referenceNumber ?? '',
      paymentMode: routeState.paymentMode ?? null,
      paidFromAccountId: routeState.paidFromAccountId ?? null,
      remarks: routeState.remarks ?? '',
    });
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
          void this.routerNavigationService.navigateToRoute([
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.PETRO_CARD,
            ROUTES.PETRO_CARD.WALLET,
          ]);
        },
        error: error => {
          this.logger.logUserAction('Failed to update wallet recharge', error);
        },
      });
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Recharge',
      subtitle: 'Correct a PetroCard wallet recharge',
    };
  }
}
