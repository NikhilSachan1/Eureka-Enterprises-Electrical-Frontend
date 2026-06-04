import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnvironmentService } from '@core/services';
import { EEnvironment } from '@core/types';

@Component({
  selector: 'app-environment-banner',
  standalone: true,
  templateUrl: './environment-banner.component.html',
  styleUrl: './environment-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentBannerComponent {
  private readonly environmentService = inject(EnvironmentService);

  protected readonly EEnvironment = EEnvironment;
  protected readonly showBanner = !this.environmentService.isProduction;
  protected readonly environment = this.environmentService.currentEnvironment;
}
