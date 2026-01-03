import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs/operators';
import { PopoverModule, Popover } from 'primeng/popover';
import { AuthService } from '@features/auth-management/services/auth.service';
import { ISwitchActiveRoleResponseDto } from '@features/auth-management/types/auth.dto';
import { LoggerService } from '@core/services';
import {
  AppConfigurationService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { getMappedValueFromArrayOfObjects, toTitleCase } from '@shared/utility';
import { ICONS } from '@shared/constants';

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

  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);

  /** Computed roles from auth service */
  readonly roles = computed<UserRole[]>(() => {
    const user = this.authService.user();
    if (!user?.roles?.length) {
      return [];
    }
    return user.roles.map(role => ({
      id: role,
      name: toTitleCase(role),
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
  ALL_ICONS = ICONS;

  togglePopover(event: Event): void {
    this.rolePopover.toggle(event);
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
  /**
   * Execute role switch and reload all app data
   * Similar to login flow - new token means new permissions
   */
  private executeSwitchActiveRole(targetRole: string): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Switching Role',
      message: 'Please wait while we configure your new role...',
    });

    // Step 1: Call switch role API (gets new token)
    // Step 2: Reload all app data using common service method
    this.authService
      .switchActiveRole(targetRole)
      .pipe(
        // After role switch, reload all app data
        switchMap((response: ISwitchActiveRoleResponseDto) => {
          this.logger.info(
            `Role switched to: ${response.activeRole}, reloading app data...`
          );

          // Use common method to reload all app data
          return this.appConfigurationService.loadAllAppData().pipe(
            // Pass the original response for success notification
            switchMap(() => [response])
          );
        }),
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
          this.logger.info('Role switch complete with app data reloaded');
        },
        error: error => {
          this.logger.error('Error during switch active role', error);
          this.notificationService.error(
            'Failed to switch role. Please try again.'
          );
        },
      });
  }
}
