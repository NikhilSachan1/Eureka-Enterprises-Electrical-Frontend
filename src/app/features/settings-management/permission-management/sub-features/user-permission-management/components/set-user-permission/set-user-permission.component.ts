import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
  viewChild,
} from '@angular/core';
import { SetPermissionComponent } from '../../../../shared/components/set-permission/set-permission.component';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services';
import {
  RouterNavigationService,
  NotificationService,
  LoadingService,
} from '@shared/services';
import {
  ICategorizedPermissions,
  ISetPermissionData,
  IDefaultPermissions,
} from '../../../../shared/types/set-permission.interface';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/models';
import {
  IUserPermissionsGetResponseDto,
  IUserPermissionsSetRequestDto,
} from '../../types/user-permissions.dto';
import { UserPermissionService } from '../../services/user-permission.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PreventReloadComponent } from '@shared/components/prevent-reload/prevent-reload.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-set-user-permission',
  imports: [PageHeaderComponent, SetPermissionComponent],
  templateUrl: './set-user-permission.component.html',
  styleUrl: './set-user-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetUserPermissionComponent
  extends PreventReloadComponent
  implements OnInit
{
  readonly setPermissionComponent = viewChild.required(SetPermissionComponent);

  protected override readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userPermissionService = inject(UserPermissionService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  protected readonly isSubmitting = signal(false);
  protected readonly editUserPermissionData =
    signal<IDefaultPermissions | null>(null);

  override ngOnInit(): void {
    this.loadUserPermissionDataFromRoute();
  }

  canDeactivate(): boolean {
    if (this.setPermissionComponent()?.hasUnsavedChanges()) {
      this.logger.info(
        'Set User Permission Component: Form has unsaved changes'
      );
      return false;
    }

    this.logger.info(
      'Set User Permission Component: Form has no unsaved changes'
    );
    return true;
  }

  protected onSubmit(setPermissionData: ISetPermissionData): void {
    if (this.isSubmitting()) {
      return;
    }

    const userId = this.activatedRoute.snapshot.paramMap.get('userId');

    if (!userId) {
      this.logger.logUserAction('No user id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const { categorizedPermissions } = setPermissionData;

    const formData = this.prepareFormData(categorizedPermissions, userId);
    this.executeSetUserPermission(formData);
  }

  private executeSetUserPermission(
    formData: IUserPermissionsSetRequestDto
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating User Permission',
      message: 'Please wait while we update the user permission...',
    });

    this.userPermissionService
      .setUserPermission(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'User permission updated successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update user permission');
        },
      });
  }

  private loadUserPermissionDataFromRoute(): void {
    const userPermissionRouteData = this.activatedRoute.snapshot.data[
      'userPermissionData'
    ] as IUserPermissionsGetResponseDto | null;

    if (!userPermissionRouteData) {
      this.logger.logUserAction('No user permission data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const userPermissionData = this.prepareUserPermissionData(
      userPermissionRouteData
    );
    this.editUserPermissionData.set(userPermissionData);
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set User Permissions',
      subtitle: 'Set the permissions for the user',
    };
  }

  private prepareFormData(
    categorizedPermissions: ICategorizedPermissions,
    userId: string
  ): IUserPermissionsSetRequestDto {
    const userPermissions = [
      ...categorizedPermissions.newPermissions.map(permissionId => ({
        permissionId,
        isGranted: true,
      })),
      ...categorizedPermissions.revokedPermissions.map(permissionId => ({
        permissionId,
        isGranted: false,
      })),
    ];
    return {
      userId,
      userPermissions,
    };
  }

  private prepareUserPermissionData(
    userPermissionRouteData: IUserPermissionsGetResponseDto
  ): IDefaultPermissions {
    return userPermissionRouteData.permissions
      .flatMap(module => module.permissions)
      .reduce(
        (acc, permission) => ({
          ...acc,
          [permission.id]: {
            value: permission.isGranted,
            source: permission.source,
          },
        }),
        {} as IDefaultPermissions
      );
  }
}
