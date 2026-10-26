import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { LoggerService } from '@core/services';
import { UserOption } from '@shared/types';
import { NgClass } from '@angular/common';
import { primaryUserOptions, secondaryUserOptions } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  ISwitchActiveRoleFormDto,
  ISwitchActiveRoleResponseDto,
} from '@features/auth-management/types/auth.dto';
import {
  AppConfigurationService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  getMappedValueFromArrayOfObjects,
  toTitleCase,
} from '@shared/utility';
import { PopoverModule, Popover } from 'primeng/popover';
import { SIDEBAR_FOOTER_POPOVER_CLASS } from '../sidebar-popover.util';

interface UserRole {
  id: string;
  name: string;
}

@Component({
  selector: 'app-sidebar-user-profile',
  imports: [NgClass, PopoverModule],
  templateUrl: './sidebar-user-profile.component.html',
  styleUrls: ['./sidebar-user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarUserProfileComponent implements OnInit {
  @ViewChild('userPopover') userPopover!: Popover;

  isSidebarCollapsed = input<boolean>(false);

  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly ICONS = ICONS;
  protected readonly sidebarFooterPopoverClass = SIDEBAR_FOOTER_POPOVER_CLASS;
  protected readonly isSubmitting = signal(false);
  protected readonly menuOpen = signal(false);

  readonly primaryOptions = primaryUserOptions;
  readonly secondaryOptions = secondaryUserOptions;

  readonly user = computed(() => this.authService.user());
  readonly userAvatar = computed(() => this.authService.loggedInUserAvatar());
  readonly userDesignation = computed(() => this.getLoggedUserDesignation());

  readonly roles = computed<UserRole[]>(() => {
    const user = this.authService.user();
    if (!user?.roles?.length) {
      return [];
    }
    return user.roles.map(role => ({
      id: role,
      name: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.roleList(),
        role
      ),
    }));
  });

  readonly activeRoleId = computed(() => this.authService.user()?.activeRole ?? '');

  readonly activeRoleName = computed(() =>
    getMappedValueFromArrayOfObjects(
      this.appConfigurationService.roleList(),
      this.activeRoleId()
    )
  );

  readonly hasMultipleRoles = computed(() => this.roles().length > 1);

  ngOnInit(): void {
    this.authService.ensureLoggedInUserProfilePictureLoaded();
  }

  getLoggedUserDesignation(): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.designations(),
      this.user()?.designation ?? ''
    );
  }

  toggleUserOptions(event: Event): void {
    event.stopPropagation();
    this.userPopover.toggle(event);
  }

  onMenuShow(): void {
    this.menuOpen.set(true);
  }

  onMenuHide(): void {
    this.menuOpen.set(false);
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

  selectRole(role: UserRole): void {
    if (role.id === this.activeRoleId() || this.isSubmitting()) {
      this.userPopover.hide();
      return;
    }

    this.userPopover.hide();
    this.executeSwitchActiveRole(role.id);
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
    if (option.id === 'logout') {
      this.logout();
    } else if (option.path) {
      this.navigateTo(option.path);
    }
  }

  private executeSwitchActiveRole(targetRole: string): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Switching Role',
      message: "We're configuring your new role. This will just take a moment.",
    });

    this.authService
      .switchActiveRole(this.prepareFormData(targetRole))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ISwitchActiveRoleResponseDto) => {
          this.notificationService.success(
            `Switched to role: ${toTitleCase(response.activeRole)}`
          );
          window.location.reload();
        },
        error: error => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
          this.logger.error('Error during switch active role', error);
          this.notificationService.error(
            'Failed to switch role. Please try again.'
          );
        },
      });
  }

  private prepareFormData(targetRole: string): ISwitchActiveRoleFormDto {
    return { targetRole };
  }
}
