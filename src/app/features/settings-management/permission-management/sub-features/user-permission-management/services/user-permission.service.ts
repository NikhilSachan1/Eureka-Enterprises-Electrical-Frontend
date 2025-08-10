import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import {
  LoggerService,
  ApiService,
  AppPermissionService,
} from '@core/services';
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
  IUserPermissionsSetRequestDto,
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

  private permissions$ = new BehaviorSubject<IAppPermission>([]);

  setUserPermission(
    formData: IUserPermissionsSetRequestDto
  ): Observable<IUserPermissionsSetResponseDto> {
    this.logger.logUserAction('Set User Permission Request', formData);

    return this.apiService
      .postValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.SET}`,
        formData,
        UserPermissionsSetRequestSchema,
        UserPermissionsSetResponseSchema
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
        formData,
        UserPermissionsDeleteRequestSchema,
        UserPermissionsDeleteResponseSchema
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
        UserPermissionsGetResponseSchema,
        params,
        UserPermissionsGetRequestSchema
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

  fetchAndStoreLoggedInUserPermissions(): Observable<IUserPermissionsGetResponseDto> {
    return this.getUserPermission().pipe(
      tap(res => {
        const permissions = this.getFormatedPermissions(res);
        const storage = localStorage.getItem('user_data')
          ? localStorage
          : sessionStorage;
        const userData = JSON.parse(storage?.getItem('user_data') ?? '{}');
        if (userData) {
          this.permissions$.next(permissions);
          storage?.setItem(
            'user_data',
            JSON.stringify({ ...userData, permissions })
          );
          this.appPermisisonService.setPermissions(permissions);
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
