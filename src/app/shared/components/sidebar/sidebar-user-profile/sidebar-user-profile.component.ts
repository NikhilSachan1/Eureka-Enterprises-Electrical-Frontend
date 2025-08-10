import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService, ThemeService } from '@core/services';
import { fadeInOut } from '@shared/animations';
import { UserOption } from '@shared/models';
import { NgClass } from '@angular/common';
import { primaryUserOptions, secondaryUserOptions } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { LoadingService } from '@shared/services';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-sidebar-user-profile',
  imports: [NgClass],
  templateUrl: './sidebar-user-profile.component.html',
  styleUrls: ['./sidebar-user-profile.component.scss'],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarUserProfileComponent {
  private router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = computed(() => this.authService.user());
  readonly userAvatar = computed(() => this.authService.loggedInUserAvatar());

  readonly showUserOptions = signal(false);

  // User options from configuration
  readonly primaryOptions = primaryUserOptions;
  readonly secondaryOptions = secondaryUserOptions;

  // Dynamic properties
  getThemeIcon(): string {
    return this.themeService.isDarkMode() ? 'pi-sun' : 'pi-moon';
  }

  getThemeLabel(): string {
    return this.themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode';
  }

  @HostListener('window:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-options') && !target.matches('img')) {
      this.showUserOptions.set(false);
    }
  }

  toggleUserOptions(): void {
    this.showUserOptions.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateTo(path: string): void {
    void this.router.navigate([path]);
    this.showUserOptions.set(false);
  }

  logout(): void {
    this.showUserOptions.set(false);

    this.loadingService.show({
      title: 'Logging Out',
      message: 'Please wait while we log you out...',
    });

    this.authService
      .logout()
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.logger.info('Logging out user');
          void this.router.navigate([
            `/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`,
          ]);
        },
        error: error => {
          this.logger.error('Error during logout', error);
        },
      });
  }

  // Method to handle option click
  handleOptionClick(option: UserOption): void {
    if (option.id === 'theme') {
      this.toggleTheme();
    } else if (option.id === 'logout') {
      this.logout();
    } else if (option.path) {
      this.navigateTo(option.path);
    }
  }
}
