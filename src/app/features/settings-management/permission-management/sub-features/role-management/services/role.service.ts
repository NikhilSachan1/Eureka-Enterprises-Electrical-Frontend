import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  IRoleAddRequestDto,
  IRoleAddResponseDto,
  IRoleDeleteRequestDto,
  IRoleDeleteResponseDto,
  IRoleEditRequestDto,
  IRoleEditResponseDto,
  IRoleGetResponseDto,
} from '../types/role.dto';
import {
  RoleAddRequestSchema,
  RoleAddResponseSchema,
  RoleDeleteRequestSchema,
  RoleDeleteResponseSchema,
  RoleEditRequestSchema,
  RoleEditResponseSchema,
  RoleGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addRole(formData: IRoleAddRequestDto): Observable<IRoleAddResponseDto> {
    this.logger.logUserAction('Add Role Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
        formData,
        RoleAddRequestSchema,
        RoleAddResponseSchema
      )
      .pipe(
        tap((response: IRoleAddResponseDto) => {
          this.logger.logUserAction('Add Role Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Role Error', error);
          } else {
            this.logger.logUserAction('Add Role Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  updateRole(
    formData: IRoleEditRequestDto,
    roleId: string
  ): Observable<IRoleEditResponseDto> {
    this.logger.logUserAction('Update Role Request', {
      roleId,
      formData,
    });

    return this.apiService
      .patchValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE.UPDATE}/${roleId}`,
        formData,
        RoleEditRequestSchema,
        RoleEditResponseSchema
      )
      .pipe(
        tap((response: IRoleEditResponseDto) => {
          this.logger.logUserAction('Update Role Success', {
            id: roleId,
            response,
          });
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Update Role Error', error);
          } else {
            this.logger.logUserAction('Update Role Error', {
              id: roleId,
              error,
            });
          }
          return throwError(() => error);
        })
      );
  }

  getRoleList(): Observable<IRoleGetResponseDto> {
    this.logger.logUserAction('Get Role List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.LIST,
        RoleGetResponseSchema
      )
      .pipe(
        tap((response: IRoleGetResponseDto) => {
          this.logger.logUserAction('Get Role List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Role List Error', error);
          } else {
            this.logger.logUserAction('Get Role List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteRole(
    formData: IRoleDeleteRequestDto
  ): Observable<IRoleDeleteResponseDto> {
    this.logger.logUserAction('Delete Role Request', formData);

    return this.apiService
      .deleteValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE.DELETE}`,
        RoleDeleteResponseSchema,
        formData,
        RoleDeleteRequestSchema
      )
      .pipe(
        tap((response: IRoleDeleteResponseDto) => {
          this.logger.logUserAction('Delete Role Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Role Error', error);
          } else {
            this.logger.logUserAction('Delete Role Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
