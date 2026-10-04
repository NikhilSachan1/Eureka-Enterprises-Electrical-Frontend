import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Card } from 'primeng/card';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionService, LoggerService } from '@core/services';
import { dashOutlinedLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import { PetroCardWalletService } from '@features/transport-management/petro-card-management/wallet/services/petro-card-wallet.service';
import type { IWalletBalanceResponseDto } from '@features/transport-management/petro-card-management/wallet/types/petro-card-wallet.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-petro-card-wallet-dashboard',
  imports: [Card, CurrencyPipe, ButtonComponent],
  templateUrl: './petro-card-wallet-dashboard.component.html',
  styleUrl: './petro-card-wallet-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetroCardWalletDashboardComponent implements OnInit {
  private readonly walletService = inject(PetroCardWalletService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  /** When false, hides the “Open wallet” CTA (e.g. already on wallet page). */
  readonly showWalletLink = input(true);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly canView = this.appPermissionService.hasPermission(
    APP_PERMISSION.PETRO_CARD.WALLET_VIEW
  );

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly balance = signal<IWalletBalanceResponseDto | null>(null);

  protected readonly availableAmount = computed(
    () => this.balance()?.balance ?? 0
  );
  protected readonly isHealthyBalance = computed(
    () => this.availableAmount() > 0
  );

  protected readonly openWalletButton = dashOutlinedLinkButton({
    label: 'Open wallet',
    icon: ICONS.COMMON.EXTERNAL_LINK,
  });

  ngOnInit(): void {
    this.reloadBalance();
  }

  /** Public so parent pages can refresh after add/edit/delete. */
  reloadBalance(): void {
    if (!this.canView) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.walletService
      .getBalance()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.balance.set(response);
          this.loadError.set(false);
          this.logger.logUserAction('Petro card wallet balance loaded');
        },
        error: error => {
          this.loadError.set(true);
          this.logger.logUserAction(
            'Failed to load petro card wallet balance',
            error
          );
        },
      });
  }

  protected openWallet(): void {
    void this.router.navigate([
      '/',
      ROUTE_BASE_PATHS.TRANSPORT,
      ROUTE_BASE_PATHS.PETRO_CARD,
      ROUTES.PETRO_CARD.WALLET,
    ]);
  }
}
