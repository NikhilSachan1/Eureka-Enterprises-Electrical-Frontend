import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  IRolePermissionsGetRequestDto,
  IRolePermissionsGetResponseDto,
  IRolePermissionsSetRequestDto,
  IRolePermissionsSetResponseDto,
} from '../types/role-permission.dto';
import {
  RolePermissionsGetRequestSchema,
  RolePermissionsGetResponseSchema,
  RolePermissionsSetRequestSchema,
  RolePermissionsSetResponseSchema,
} from '../schemas';
import { API_ROUTES } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class RolePermissionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  setRolePermission(
    formData: IRolePermissionsSetRequestDto
  ): Observable<IRolePermissionsSetResponseDto> {
    this.logger.logUserAction('Set Role Permission Request', formData);

    return this.apiService
      .postValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET}`,
        formData,
        RolePermissionsSetRequestSchema,
        RolePermissionsSetResponseSchema
      )
      .pipe(
        tap((response: IRolePermissionsSetResponseDto) => {
          this.logger.logUserAction('Set Role Permission Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Set Role Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Set Role Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getRolePermission(
    params: IRolePermissionsGetRequestDto
  ): Observable<IRolePermissionsGetResponseDto> {
    this.logger.logUserAction('Get Role Permission Request', params);

    return this.apiService
      .getValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.LIST}`,
        RolePermissionsGetResponseSchema,
        params,
        RolePermissionsGetRequestSchema
      )
      .pipe(
        tap((response: IRolePermissionsGetResponseDto) => {
          this.logger.logUserAction('Get Role Permission Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Role Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Role Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
