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
import { AppConfigurationService, LoadingService } from '@shared/services';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { PopoverModule, Popover } from 'primeng/popover';
import {
  RoleSwitcherComponent,
  UserRole,
} from '../role-switcher/role-switcher.component';

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

  readonly user = computed(() => this.authService.user());
  readonly userAvatar = computed(() => this.authService.loggedInUserAvatar());

  // Role Switcher - Mock data for UI demo
  readonly userRoles = signal<UserRole[]>([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      icon: 'pi pi-shield',
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Team management access',
      icon: 'pi pi-users',
    },
    {
      id: 'employee',
      name: 'Employee',
      description: 'Standard access',
      icon: 'pi pi-user',
    },
  ]);

  readonly activeRole = signal<UserRole>({
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    icon: 'pi pi-shield',
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
    this.activeRole.set(role);
    this.logger.info(`Switched to role: ${role.name}`);
  }
}
