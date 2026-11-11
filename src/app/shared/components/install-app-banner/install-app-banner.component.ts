import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { PwaInstallService } from '@core/services/pwa-install.service';
import { ICONS } from '@shared/constants';

/** Form pages have a sticky Submit bar at the bottom; don't cover it. */
const FORM_ROUTE_PATTERN = /\/(add|edit|force|reimburse)(\/|\?|$)/;

/** Mobile-only bottom sheet inviting the user to install the app. */
@Component({
  selector: 'app-install-app-banner',
  templateUrl: './install-app-banner.component.html',
  styleUrl: './install-app-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallAppBannerComponent {
  private readonly router = inject(Router);
  protected readonly pwaInstall = inject(PwaInstallService);
  protected readonly ICONS = ICONS;
  protected readonly installing = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly visible = computed(
    () => this.pwaInstall.showBanner() && !FORM_ROUTE_PATTERN.test(this.url())
  );

  protected async onInstall(): Promise<void> {
    this.installing.set(true);
    try {
      await this.pwaInstall.promptInstall();
    } finally {
      this.installing.set(false);
    }
  }

  protected onDismiss(): void {
    this.pwaInstall.dismiss();
  }
}
