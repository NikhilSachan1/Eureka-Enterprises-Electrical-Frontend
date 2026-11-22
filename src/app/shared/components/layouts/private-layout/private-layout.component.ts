import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@features/auth-management/services/auth.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { InstallAppBannerComponent } from '../../install-app-banner/install-app-banner.component';
import { CommandPaletteComponent } from '../../command-palette/command-palette.component';
import { NotificationToastComponent } from '@features/notification-management/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-private-layout',
  imports: [
    SidebarComponent,
    RouterOutlet,
    InstallAppBannerComponent,
    CommandPaletteComponent,
    NotificationToastComponent,
  ],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateLayoutComponent {
  protected readonly authService = inject(AuthService);
}
