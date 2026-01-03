import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService, ThemeService } from '@core/services';
import { UserOption } from '@shared/types';
import { NgClass } from '@angular/common';
import { primaryUserOptions, secondaryUserOptions } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  AppConfigurationService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { getMappedValueFromArrayOfObjects, toTitleCase } from '@shared/utility';
import { PopoverModule, Popover } from 'primeng/popover';
import {
  RoleSwitcherComponent,
  UserRole,
} from '../role-switcher/role-switcher.component';
import { ISwitchActiveRoleResponseDto } from '@features/auth-management/types/auth.dto';

@Component({
  selector: 'app-sidebar-user-profile',
  imports: [NgClass, PopoverModule, RoleSwitcherComponent],
  templateUrl: './sidebar-user-profile.component.html',
  styleUrls: ['./sidebar-user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarUserProfileComponent {
  @ViewChild('userPopover') userPopover!: Popover;

  private router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly notificationService = inject(NotificationService);

  protected readonly isSubmitting = signal(false);
  readonly user = computed(() => this.authService.user());
  readonly userAvatar = computed(() => this.authService.loggedInUserAvatar());

  readonly userRoles = computed<UserRole[]>(() => {
    const user = this.user();
    if (!user?.roles?.length) {
      return [];
    }

    return user.roles.map(role => ({
      id: role,
      name: toTitleCase(role),
    }));
  });

  // Get the active role as UserRole object
  readonly activeRole = computed<UserRole>(() => {
    const user = this.user();
    const activeRoleId = user?.activeRole ?? '';

    return {
      id: activeRoleId,
      name: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.roleList(),
        activeRoleId
      ),
    };
  });

  readonly hasMultipleRoles = computed(() => this.userRoles().length > 1);

  // User options from configuration
  readonly primaryOptions = primaryUserOptions;
  readonly secondaryOptions = secondaryUserOptions;

  getThemeIcon(): string {
    return this.themeService.isDarkMode() ? 'pi-sun' : 'pi-moon';
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

  handleOptionClick(option: UserOption): void {
    if (option.id === 'theme') {
      this.toggleTheme();
    } else if (option.id === 'logout') {
      this.logout();
    } else if (option.path) {
      this.navigateTo(option.path);
    }
  }

  onRoleChange(role: UserRole): void {
    this.logger.info(`Switching to role: ${role.name}`);
    this.executeSwitchActiveRole(role.id);
  }

  private executeSwitchActiveRole(targetRole: string): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Switching Active Role',
      message: 'Please wait while we switch your active role...',
    });

    this.authService
      .switchActiveRole(targetRole)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISwitchActiveRoleResponseDto) => {
          this.notificationService.success(
            `Switched to role: ${toTitleCase(response.activeRole)}`
          );
          this.logger.info(`Switched to role: ${response.activeRole}`);
        },
        error: error => {
          this.logger.error('Error during switch active role', error);
        },
      });
  }
}
