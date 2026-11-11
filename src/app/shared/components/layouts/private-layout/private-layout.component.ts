import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@features/auth-management/services/auth.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { InstallAppBannerComponent } from '../../install-app-banner/install-app-banner.component';

@Component({
  selector: 'app-private-layout',
  imports: [SidebarComponent, RouterOutlet, InstallAppBannerComponent],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateLayoutComponent {
  protected readonly authService = inject(AuthService);
}
