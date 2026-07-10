import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-version',
  standalone: true,
  templateUrl: './app-version.component.html',
  styleUrl: './app-version.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppVersionComponent {
  protected readonly version = `v${APP_CONFIG.version}`;
}
