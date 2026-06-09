import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LoggerService, ThemeService } from '@core/services';
import { UserOption } from '@shared/types';
import { NgClass } from '@angular/common';
import { primaryUserOptions, secondaryUserOptions } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  AppConfigurationService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { PopoverModule, Popover } from 'primeng/popover';
import { SIDEBAR_FOOTER_POPOVER_CLASS } from '../sidebar-popover.util';

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

  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly ICONS = ICONS;
  protected readonly sidebarFooterPopoverClass = SIDEBAR_FOOTER_POPOVER_CLASS;

  ngOnInit(): void {
    this.authService.ensureLoggedInUserProfilePictureLoaded();
  }

  readonly user = computed(() => this.authService.user());
  readonly userAvatar = computed(() => this.authService.loggedInUserAvatar());
  readonly userDesignation = computed(() => this.getLoogedUserDesignation());

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
    event.stopPropagation();
    this.userPopover.toggle(event);
  }

  @HostListener('document:visibilitychange')
  onDocumentVisibilityChange(): void {
    if (document.hidden) {
      this.userPopover?.hide();
    }
  }

  @HostListener('window:blur')
  onWindowBlur(): void {
    this.userPopover?.hide();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateTo(path: string): void {
    void this.routerNavigationService.navigateByUrl(path);
    this.userPopover.hide();
  }

  logout(): void {
    this.userPopover.hide();

    this.loadingService.show({
      title: 'Signing out',
      message: "We're signing you out. This will just take a moment.",
    });

    const hideAfterLoginRoute = (): void => {
      void this.routerNavigationService
        .navigateToRoute([ROUTE_BASE_PATHS.AUTH, ROUTES.AUTH.LOGIN])
        .finally(() => this.loadingService.hide());
    };

    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.logger.info('Logging out user');
          hideAfterLoginRoute();
        },
        error: error => {
          this.logger.error('Error during logout', error);
          hideAfterLoginRoute();
        },
      });
  }

  handleOptionClick(option: UserOption): void {
    if (option.id === 'theme') {
      this.toggleTheme();
      this.userPopover.hide();
    } else if (option.id === 'logout') {
      this.logout();
    } else if (option.path) {
      this.navigateTo(option.path);
    }
  }
}
