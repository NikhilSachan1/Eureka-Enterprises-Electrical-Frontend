import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CriticalStartupStateService } from '@core/services';
import { LoadingService } from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';

@Component({
  selector: 'app-critical-startup-error-page',
  standalone: true,
  templateUrl: './critical-startup-error-page.component.html',
  styleUrl: './critical-startup-error-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriticalStartupErrorPageComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly criticalStartupState = inject(CriticalStartupStateService);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadingService.forceHideAll();
  }

  protected reloadApp(): void {
    const redirectUrl =
      this.activatedRoute.snapshot.queryParamMap.get('redirect') ??
      this.criticalStartupState.getRedirectUrl();
    this.criticalStartupState.clearCriticalLoadFailure();
    const startupErrorPath = `/${ROUTE_BASE_PATHS.STARTUP_ERROR}`;

    if (redirectUrl && !redirectUrl.startsWith(startupErrorPath)) {
      window.location.href = redirectUrl;
      return;
    }
    window.location.href = '/';
  }
}
