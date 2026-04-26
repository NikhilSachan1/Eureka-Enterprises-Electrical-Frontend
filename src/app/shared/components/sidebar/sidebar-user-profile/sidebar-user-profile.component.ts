import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService, ThemeService } from '@core/services';
import { UserOption } from '@shared/types';
import { NgClass } from '@angular/common';
import { primaryUserOptions, secondaryUserOptions } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { AppConfigurationService, LoadingService } from '@shared/services';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { PopoverModule, Popover } from 'primeng/popover';

@Component({
  selector: 'app-sidebar-user-profile',
  imports: [NgClass, PopoverModule],
  templateUrl: './sidebar-user-profile.component.html',
  styleUrls: ['./sidebar-user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarUserProfileComponent implements OnInit {
  @ViewChild('userPopover') userPopover!: Popover;

  // Input to control layout style - centered (top) or compact (bottom)
  compact = input<boolean>(false);

  // Input to know if sidebar is collapsed
  isSidebarCollapsed = input<boolean>(false);

  private router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly ICONS = ICONS;

  constructor() {
    effect(() => {
      if (this.isSidebarCollapsed() && this.userPopover) {
        this.userPopover.hide();
      }
    });
  }

  ngOnInit(): void {
    this.authService.ensureLoggedInUserProfilePictureLoaded();
  }

  readonly user = computed(() => this.authService.user());
  readonly userAvatar = computed(() => this.authService.loggedInUserAvatar());

  // User options from configuration
  readonly primaryOptions = primaryUserOptions;
  readonly secondaryOptions = secondaryUserOptions;

  getThemeIcon(): string {
    return this.themeService.isDarkMode() ? ICONS.THEME.SUN : ICONS.THEME.MOON;
  }

  getThemeLabel(): string {
    return this.themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode';
  }

  getLoogedUserDesignation(): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.designations(),
      this.user()?.designation ?? ''
    );
  }

  toggleUserOptions(event: Event): void {
    if (this.isSidebarCollapsed()) {
      return;
    }
    this.userPopover.toggle(event);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateTo(path: string): void {
    void this.router.navigate([path]);
    this.userPopover.hide();
  }

  logout(): void {
    this.userPopover.hide();

    this.loadingService.show({
      title: 'Signing out',
      message: "We're signing you out. This will just take a moment.",
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
