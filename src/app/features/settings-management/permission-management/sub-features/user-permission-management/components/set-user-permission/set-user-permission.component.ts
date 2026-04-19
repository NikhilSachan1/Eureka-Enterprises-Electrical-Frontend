import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { SetPermissionComponent } from '../../../../shared/components/set-permission/set-permission.component';
import { ActivatedRoute } from '@angular/router';
import { RouterNavigationService } from '@shared/services';
import {
  ICategorizedPermissions,
  ISetPermissionData,
  IDefaultPermissions,
} from '../../../../shared/types/set-permission.interface';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import {
  IUserPermissionsGetResponseDto,
  IUserPermissionsSetFormDto,
  IUserPermissionsSetResponseDto,
} from '../../types/user-permissions.dto';
import { UserPermissionService } from '../../services/user-permission.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-set-user-permission',
  imports: [PageHeaderComponent, SetPermissionComponent],
  templateUrl: './set-user-permission.component.html',
  styleUrl: './set-user-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetUserPermissionComponent extends FormBase implements OnInit {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userPermissionService = inject(UserPermissionService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialUserPermissionData =
    signal<IDefaultPermissions | null>(null);
  private readonly latestPermissionsData = signal<ISetPermissionData | null>(
    null
  );

  ngOnInit(): void {
    this.loadUserPermissionDataFromRoute();
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

    const userPermissionData = this.preparePrefilledFormData(
      userPermissionRouteData
    );
    this.initialUserPermissionData.set(userPermissionData);
  }

  private preparePrefilledFormData(
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

  protected override handleSubmit(): void {
    const data = this.latestPermissionsData();
    if (!data) {
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
    const formData = this.prepareFormData(data.categorizedPermissions, userId);
    this.executeSetUserPermission(formData);
  }

  protected onModulePermissionsSubmit(
    setPermissionData: ISetPermissionData
  ): void {
    this.latestPermissionsData.set(setPermissionData);
    this.handleSubmit();
  }

  private prepareFormData(
    categorizedPermissions: ICategorizedPermissions,
    userId: string
  ): IUserPermissionsSetFormDto {
    return {
      userId,
      ...categorizedPermissions,
    };
  }

  private executeSetUserPermission(formData: IUserPermissionsSetFormDto): void {
    this.loadingService.show({
      title: 'Updating user permissions',
      message:
        "We're updating the user permission. This will just take a moment.",
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
        next: (response: IUserPermissionsSetResponseDto) => {
          this.notificationService.bulkOperationFromApiResponse(
            response,
            'user permission',
            'update'
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

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set User Permissions',
      subtitle: 'Set the permissions for the user',
    };
  }
}
