import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnvironmentService } from '@core/services';
import { EEnvironment } from '@core/types';

const ENVIRONMENT_LABELS: Record<string, string> = {
  [EEnvironment.LOCAL]: 'Local',
  [EEnvironment.DEVELOPMENT]: 'UAT',
  [EEnvironment.PRODUCTION]: 'Prod',
};

@Component({
  selector: 'app-environment-banner',
  standalone: true,
  templateUrl: './environment-banner.component.html',
  styleUrl: './environment-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentBannerComponent {
  private readonly environmentService = inject(EnvironmentService);

  private readonly appEnvironment = this.environmentService.currentEnvironment;
  private readonly apiEnvironment = this.environmentService.apiEnvironment;
  private readonly isProductionApp = this.environmentService.isProduction;
  private readonly isProductionApi =
    this.apiEnvironment === EEnvironment.PRODUCTION;

  /** Hidden only when both the app and its API are production. */
  protected readonly showBanner =
    !this.isProductionApp || !this.isProductionApi;

  protected readonly appLabel = labelFor(this.appEnvironment);
  protected readonly apiLabel = labelFor(this.apiEnvironment);

  /** App and API are on different sides of production: a test build on live data, or the reverse. */
  protected readonly isMismatch = this.isProductionApp !== this.isProductionApi;

  protected readonly variant = this.isMismatch
    ? 'danger'
    : this.appEnvironment === EEnvironment.LOCAL
      ? 'local'
      : 'uat';

  protected readonly ariaLabel = `${this.appLabel} app, ${this.apiLabel} API${
    this.isMismatch ? ' — app and API environments differ' : ''
  }`;
}

function labelFor(environment: string): string {
  return ENVIRONMENT_LABELS[environment] ?? environment.toUpperCase();
}
