import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostBinding,
  HostListener,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PopoverModule, Popover } from 'primeng/popover';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  ISwitchActiveRoleFormDto,
  ISwitchActiveRoleResponseDto,
} from '@features/auth-management/types/auth.dto';
import { LoggerService } from '@core/services';
import {
  AppConfigurationService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { getMappedValueFromArrayOfObjects, toTitleCase } from '@shared/utility';
import { ICONS, ROUTE_BASE_PATHS } from '@shared/constants';
import { SIDEBAR_FOOTER_POPOVER_CLASS } from '../sidebar-popover.util';

export interface UserRole {
  id: string;
  name: string;
}

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [PopoverModule],
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSwitcherComponent {
  @ViewChild('rolePopover') rolePopover!: Popover;

  // Input for sidebar collapsed state
  isSidebarCollapsed = input<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  protected readonly sidebarFooterPopoverClass = SIDEBAR_FOOTER_POPOVER_CLASS;

  /** Computed roles from auth service */
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

  /** Computed active role from auth service */
  readonly activeRole = computed<UserRole>(() => {
    const user = this.authService.user();
    const activeRoleId = user?.activeRole ?? '';
    return {
      id: activeRoleId,
      name: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.roleList(),
        activeRoleId
      ),
    };
  });

  /** Check if user has multiple roles */
  readonly hasMultipleRoles = computed(() => this.roles().length > 1);

  /** Hide host when there is no role switcher UI — avoids empty strip between menu and footer. */
  @HostBinding('class.role-switcher--hidden')
  protected get roleSwitcherHidden(): boolean {
    return !this.hasMultipleRoles();
  }

  ALL_ICONS = ICONS;

  togglePopover(event: Event): void {
    event.stopPropagation();
    this.rolePopover.toggle(event);
  }

  @HostListener('document:visibilitychange')
  onDocumentVisibilityChange(): void {
    if (document.hidden) {
      this.rolePopover?.hide();
    }
  }

  @HostListener('window:blur')
  onWindowBlur(): void {
    this.rolePopover?.hide();
  }

  /**
   * Handle role selection - calls API and reloads app data
   */
  selectRole(role: UserRole): void {
    // Don't switch if same role or already submitting
    if (role.id === this.activeRole().id || this.isSubmitting()) {
      this.rolePopover.hide();
      return;
    }

    this.rolePopover.hide();
    this.executeSwitchActiveRole(role.id);
  }
  /** Role switch API → full reload on dashboard (permissions reload on bootstrap). */
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
          window.location.replace(`/${ROUTE_BASE_PATHS.DASHBOARD}`);
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
    return {
      targetRole,
    };
  }
}
