import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { LoggerService, ApiService } from '@core/services';
import { Observable, tap, catchError, throwError } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class UserPermissionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

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
}
