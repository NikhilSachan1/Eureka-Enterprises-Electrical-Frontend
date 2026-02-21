import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import {
  LoggerService,
  ApiService,
  AppPermissionService,
} from '@core/services';
import {
  APP_PERMISSION,
  UI_PERMISSIONS_ROLE_MAP,
} from '@core/constants/app-permission.constant';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  Observable,
  tap,
  catchError,
  throwError,
  BehaviorSubject,
  interval,
  switchMap,
} from 'rxjs';
import {
  IUserPermissionsDeleteRequestDto,
  IUserPermissionsDeleteResponseDto,
  IUserPermissionsGetRequestDto,
  IUserPermissionsGetResponseDto,
  IUserPermissionsSetFormDto,
  IUserPermissionsSetResponseDto,
} from '../types/user-permissions.dto';
import {
  UserPermissionsDeleteRequestSchema,
  UserPermissionsDeleteResponseSchema,
  UserPermissionsGetRequestSchema,
  UserPermissionsGetResponseSchema,
  UserPermissionsSetRequestSchema,
  UserPermissionsSetResponseSchema,
} from '../schemas';
import { APP_CONFIG } from '@core/config/app.config';
import { IAppPermission } from '../types/user-permission.interface';

@Injectable({
  providedIn: 'root',
})
export class UserPermissionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly appPermisisonService = inject(AppPermissionService);
  private readonly authService = inject(AuthService);

  private permissions$ = new BehaviorSubject<IAppPermission>([]);

  setUserPermission(
    formData: IUserPermissionsSetFormDto
  ): Observable<IUserPermissionsSetResponseDto> {
    this.logger.logUserAction('Set User Permission Request', formData);

    return this.apiService
      .postValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.SET}`,
        {
          response: UserPermissionsSetResponseSchema,
          request: UserPermissionsSetRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IUserPermissionsSetResponseDto) => {
          this.logger.logUserAction('Set User Permission Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Set User Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Set User Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteUserPermissions(
    formData: IUserPermissionsDeleteRequestDto
  ): Observable<IUserPermissionsDeleteResponseDto> {
    this.logger.logUserAction('Delete User Permission Request', formData);

    return this.apiService
      .deleteValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.DELETE}`,
        {
          response: UserPermissionsDeleteResponseSchema,
          request: UserPermissionsDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IUserPermissionsDeleteResponseDto) => {
          this.logger.logUserAction('Delete User Permission Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete User Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete User Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getUserPermission(
    params?: IUserPermissionsGetRequestDto
  ): Observable<IUserPermissionsGetResponseDto> {
    this.logger.logUserAction('Get User Permission Request', params);

    return this.apiService
      .getValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.LIST}`,
        {
          response: UserPermissionsGetResponseSchema,
          request: UserPermissionsGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IUserPermissionsGetResponseDto) => {
          this.logger.logUserAction('Get User Permission Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get User Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Get User Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  private getUIPermissionsByRole(): IAppPermission {
    const role = this.authService.getCurrentUser()?.activeRole;
    if (!role) {
      return [];
    }

    const uiPermissions: IAppPermission = [];
    const roleMap = UI_PERMISSIONS_ROLE_MAP as Record<
      string,
      Record<string, Record<string, boolean>>
    >;

    for (const [moduleKey, permissions] of Object.entries(roleMap)) {
      const modulePermissions =
        APP_PERMISSION.UI[moduleKey as keyof typeof APP_PERMISSION.UI];

      if (modulePermissions) {
        for (const [permissionKey, roleAccess] of Object.entries(permissions)) {
          if (roleAccess[role]) {
            const permission =
              modulePermissions[
                permissionKey as keyof typeof modulePermissions
              ];

            if (permission) {
              uiPermissions.push(permission);
            }
          }
        }
      }
    }

    return uiPermissions;
  }

  fetchAndStoreLoggedInUserPermissions(): Observable<IUserPermissionsGetResponseDto> {
    return this.getUserPermission().pipe(
      tap(res => {
        const backendPermissions = this.getFormatedPermissions(res);
        const uiPermissions = this.getUIPermissionsByRole();

        const allPermissions = [...backendPermissions, ...uiPermissions];

        const storage = localStorage.getItem('user_data')
          ? localStorage
          : sessionStorage;
        const userData = JSON.parse(storage?.getItem('user_data') ?? '{}');
        if (userData) {
          this.permissions$.next(allPermissions);
          storage?.setItem(
            'user_data',
            JSON.stringify({ ...userData, permissions: allPermissions })
          );
          this.appPermisisonService.setPermissions(allPermissions);
        }
      })
    );
  }

  startPeriodicRefresh(): void {
    interval(APP_CONFIG.USER_PERMISSION_CONFIG.refreshInterval)
      .pipe(switchMap(() => this.fetchAndStoreLoggedInUserPermissions()))
      .subscribe();
  }

  private getFormatedPermissions(
    userPermissionResponse: IUserPermissionsGetResponseDto
  ): IAppPermission {
    const grantedPermissions = userPermissionResponse.permissions.flatMap(
      module => {
        const granted = module.permissions
          .filter(perm => perm.isGranted)
          .map(perm => perm.name);

        return granted;
      }
    );

    const modulesWithGrantedPermissions = userPermissionResponse.permissions
      .filter(module => module.permissions.some(perm => perm.isGranted))
      .map(module => `module_${module.module}`);

    return [...grantedPermissions, ...modulesWithGrantedPermissions];
  }
}
