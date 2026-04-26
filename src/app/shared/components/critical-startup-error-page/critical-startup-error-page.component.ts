import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CriticalStartupStateService } from '@core/services';
import { LoadingService } from '@shared/services';

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
  protected readonly failureReason = this.criticalStartupState.failureReason;

  protected get isHealthFailure(): boolean {
    return this.failureReason() === 'health';
  }

  ngOnInit(): void {
    this.loadingService.forceHideAll();
  }

  protected reloadApp(): void {
    this.criticalStartupState.clearCriticalLoadFailure();
    window.location.reload();
  }
}
